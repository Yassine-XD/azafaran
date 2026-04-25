// Unit test for notification.service.dispatchToTokens flow.
// Mocks both the Expo wrapper and the repository so it does not touch the DB.

jest.mock("../services/expoPush.service", () => {
  const sendChunked = jest.fn();
  const isExpoPushToken = jest.fn((t: string) => t.startsWith("ExponentPushToken"));
  const getReceipts = jest.fn();
  return { expoPush: { sendChunked, isExpoPushToken, getReceipts } };
});

jest.mock("../repositories/notification.repository", () => {
  const findActivePushTokens = jest.fn().mockResolvedValue([]);
  const createLog = jest.fn().mockResolvedValue({ id: "log-default" });
  const updateReceiptId = jest.fn().mockResolvedValue(undefined);
  const updateLogStatus = jest.fn().mockResolvedValue(undefined);
  const deactivateByToken = jest.fn().mockResolvedValue(undefined);
  return {
    notificationRepository: {
      findActivePushTokens,
      createLog,
      updateReceiptId,
      updateLogStatus,
      deactivateByToken,
    },
  };
});

import { notificationService } from "../services/notification.service";
import { expoPush } from "../services/expoPush.service";
import { notificationRepository } from "../repositories/notification.repository";

const mockedExpo = expoPush as jest.Mocked<typeof expoPush>;
const mockedRepo = notificationRepository as jest.Mocked<
  typeof notificationRepository
>;

describe("notificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default resolved values after clearAllMocks wipes them.
    mockedRepo.findActivePushTokens.mockResolvedValue([]);
    mockedRepo.createLog.mockResolvedValue({ id: "log-default" } as any);
    mockedRepo.updateReceiptId.mockResolvedValue(undefined as any);
    mockedRepo.updateLogStatus.mockResolvedValue(undefined as any);
    mockedRepo.deactivateByToken.mockResolvedValue(undefined as any);
  });

  describe("sendOrderNotification", () => {
    it("logs without push when user has no active tokens", async () => {
      mockedRepo.findActivePushTokens.mockResolvedValue([]);
      mockedRepo.createLog.mockResolvedValue({ id: "log-1" } as any);

      await notificationService.sendOrderNotification(
        "user-1",
        "order_confirmed",
        "order-1",
      );

      expect(mockedRepo.createLog).toHaveBeenCalledTimes(1);
      expect(mockedRepo.createLog.mock.calls[0][0]).toMatchObject({
        userId: "user-1",
        orderId: "order-1",
        eventType: "order_confirmed",
        notifData: { v: 1, type: "order", orderId: "order-1" },
      });
      expect(mockedExpo.sendChunked).not.toHaveBeenCalled();
    });

    it("sends to Expo and stores receipt id when ticket is ok", async () => {
      mockedRepo.findActivePushTokens.mockResolvedValue([
        { id: "tok-1", token: "ExponentPushToken[abc]" },
      ] as any);
      mockedRepo.createLog.mockResolvedValue({ id: "log-1" } as any);
      mockedExpo.sendChunked.mockResolvedValue([
        { status: "ok", id: "receipt-xyz" } as any,
      ]);

      await notificationService.sendOrderNotification(
        "user-1",
        "order_shipped",
        "order-2",
      );

      expect(mockedExpo.sendChunked).toHaveBeenCalledTimes(1);
      const messages = mockedExpo.sendChunked.mock.calls[0][0];
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        to: "ExponentPushToken[abc]",
        title: "Pedido en camino",
        data: {
          v: 1,
          type: "order",
          orderId: "order-2",
          logId: "log-1",
        },
      });
      expect(mockedRepo.updateReceiptId).toHaveBeenCalledWith(
        "log-1",
        "receipt-xyz",
      );
      expect(mockedRepo.updateLogStatus).not.toHaveBeenCalled();
    });

    it("marks log failed and deactivates the token on DeviceNotRegistered", async () => {
      mockedRepo.findActivePushTokens.mockResolvedValue([
        { id: "tok-1", token: "ExponentPushToken[dead]" },
      ] as any);
      mockedRepo.createLog.mockResolvedValue({ id: "log-1" } as any);
      mockedExpo.sendChunked.mockResolvedValue([
        {
          status: "error",
          message: "device gone",
          details: { error: "DeviceNotRegistered" },
        } as any,
      ]);

      await notificationService.sendOrderNotification(
        "user-1",
        "order_delivered",
        "order-3",
      );

      expect(mockedRepo.updateLogStatus).toHaveBeenCalledWith(
        "log-1",
        "failed",
        "device gone",
      );
      expect(mockedRepo.deactivateByToken).toHaveBeenCalledWith(
        "ExponentPushToken[dead]",
      );
    });
  });

  describe("sendCustomNotification", () => {
    it("logs no-token users and pushes to users with tokens", async () => {
      mockedRepo.findActivePushTokens.mockImplementation(async (uid) => {
        if (uid === "user-with-token")
          return [{ id: "tok-1", token: "ExponentPushToken[a]" }] as any;
        return [];
      });
      mockedRepo.createLog.mockImplementation(
        async () => ({ id: "log-" + Math.random().toString(36).slice(2, 8) }) as any,
      );
      mockedExpo.sendChunked.mockResolvedValue([
        { status: "ok", id: "rcpt-1" } as any,
      ]);

      const result = await notificationService.sendCustomNotification({
        userIds: ["user-with-token", "user-no-token"],
        title: "Cupón especial",
        body: "Aprovecha 10% de descuento",
        payload: { v: 1, type: "coupon", promoCode: "WELCOME10" },
      });

      expect(result.sent).toBe(1);
      expect(result.logged).toBe(1);
      expect(mockedRepo.createLog).toHaveBeenCalledTimes(2);
      expect(mockedExpo.sendChunked).toHaveBeenCalledTimes(1);
      const messages = mockedExpo.sendChunked.mock.calls[0][0];
      expect(messages[0].data).toMatchObject({
        type: "coupon",
        promoCode: "WELCOME10",
      });
      expect((messages[0].data as any).logId).toBeDefined();
    });

    it("rejects non-Expo tokens without sending", async () => {
      mockedRepo.findActivePushTokens.mockResolvedValue([
        { id: "tok-1", token: "not-an-expo-token" },
      ] as any);
      mockedRepo.createLog.mockResolvedValue({ id: "log-1" } as any);

      const result = await notificationService.sendCustomNotification({
        userIds: ["user-1"],
        title: "t",
        body: "b",
        payload: { v: 1, type: "none" },
      });

      expect(result.sent).toBe(0);
      expect(result.failed).toBe(1);
      expect(mockedExpo.sendChunked).not.toHaveBeenCalled();
      expect(mockedRepo.deactivateByToken).toHaveBeenCalledWith(
        "not-an-expo-token",
      );
    });
  });
});
