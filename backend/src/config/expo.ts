/**
 * Expo Push Notification SDK Initialization
 */

import { Expo } from "expo-server-sdk";
import env from "./env";

const expo = new Expo({
  accessToken: env.EXPO_ACCESS_TOKEN,
});

export default expo;
