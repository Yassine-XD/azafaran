// ─── Shared base layout ──────────────────────────────

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #f5f5f5; font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #1a1a2e; padding: 24px; text-align: center; }
    .header h1 { color: #e8c547; margin: 0; font-size: 22px; letter-spacing: 1px; }
    .body { padding: 32px 24px; }
    .footer { background: #f0f0f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #888; }
    .btn { display: inline-block; padding: 12px 28px; background: #e8c547; color: #1a1a2e; text-decoration: none; border-radius: 6px; font-weight: bold; }
    table.order-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    table.order-table th { background: #f5f5f5; text-align: left; padding: 10px 12px; font-size: 13px; border-bottom: 2px solid #ddd; }
    table.order-table td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 14px; }
    .total-row td { font-weight: bold; border-top: 2px solid #333; }
    .highlight { color: #e8c547; }
    h2 { color: #1a1a2e; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Carnes Alhambra</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      Carnes Alhambra &mdash; Productos Halal frescos de calidad<br>
      Si no deseas recibir estos correos, puedes desactivar las notificaciones por email en tu perfil.
    </div>
  </div>
</body>
</html>`;
}

// ─── Types ───────────────────────────────────────────

interface OrderData {
  order_number: string;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  total: number;
  address_snapshot: {
    street: string;
    city: string;
    postcode: string;
    province?: string;
  } | null;
  delivery_notes?: string | null;
  items: Array<{
    product_snapshot: { name: string; variant_label?: string };
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
}

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
}

// ─── Status labels in Spanish ────────────────────────

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  shipped: "En camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

// ─── Helper: order items table ───────────────────────

function orderItemsTable(order: OrderData): string {
  const rows = order.items
    .map(
      (item) => `
    <tr>
      <td>${item.product_snapshot.name}${item.product_snapshot.variant_label ? ` (${item.product_snapshot.variant_label})` : ""}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${item.unit_price.toFixed(2)} &euro;</td>
      <td style="text-align:right">${item.line_total.toFixed(2)} &euro;</td>
    </tr>`,
    )
    .join("");

  return `
    <table class="order-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th style="text-align:center">Cant.</th>
          <th style="text-align:right">Precio ud.</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr><td colspan="3" style="text-align:right">Subtotal</td><td style="text-align:right">${order.subtotal.toFixed(2)} &euro;</td></tr>
        ${order.discount_amount > 0 ? `<tr><td colspan="3" style="text-align:right;color:#27ae60">Descuento</td><td style="text-align:right;color:#27ae60">-${order.discount_amount.toFixed(2)} &euro;</td></tr>` : ""}
        <tr><td colspan="3" style="text-align:right">Envío</td><td style="text-align:right">${order.delivery_fee > 0 ? order.delivery_fee.toFixed(2) + " &euro;" : "Gratis"}</td></tr>
        <tr class="total-row"><td colspan="3" style="text-align:right">Total</td><td style="text-align:right">${order.total.toFixed(2)} &euro;</td></tr>
      </tbody>
    </table>`;
}

// ─── Template functions ──────────────────────────────

export function welcomeEmail(user: UserData) {
  return {
    subject: "¡Bienvenido/a a Carnes Alhambra!",
    html: baseLayout(`
      <h2>¡Hola ${user.first_name}!</h2>
      <p>Gracias por registrarte en <strong>Carnes Alhambra</strong>. Estamos encantados de tenerte con nosotros.</p>
      <p>Ahora puedes explorar nuestra selección de productos Halal frescos y realizar tu primer pedido.</p>
      <p style="text-align:center; margin: 28px 0;">
        <a class="btn" href="#">Explorar productos</a>
      </p>
      <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p>¡Buen provecho!<br><strong>El equipo de Carnes Alhambra</strong></p>
    `),
  };
}

export function orderConfirmationEmail(order: OrderData, user: UserData) {
  const address = order.address_snapshot;
  return {
    subject: `Pedido ${order.order_number} confirmado`,
    html: baseLayout(`
      <h2>¡Gracias por tu pedido, ${user.first_name}!</h2>
      <p>Hemos recibido tu pedido <strong>${order.order_number}</strong> correctamente.</p>
      ${orderItemsTable(order)}
      ${
        address
          ? `<p><strong>Dirección de entrega:</strong><br>${address.street}, ${address.postcode} ${address.city}${address.province ? `, ${address.province}` : ""}</p>`
          : ""
      }
      ${order.delivery_notes ? `<p><strong>Notas de entrega:</strong> ${order.delivery_notes}</p>` : ""}
      <p>Te avisaremos cuando tu pedido esté en preparación.</p>
      <p>¡Gracias por confiar en nosotros!<br><strong>El equipo de Carnes Alhambra</strong></p>
    `),
  };
}

export function invoiceEmail(order: OrderData, user: UserData) {
  const address = order.address_snapshot;
  const date = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    subject: `Factura del pedido ${order.order_number}`,
    html: baseLayout(`
      <h2>Factura</h2>
      <table style="width:100%; margin-bottom:20px; font-size:14px;">
        <tr>
          <td><strong>N.º Pedido:</strong> ${order.order_number}</td>
          <td style="text-align:right"><strong>Fecha:</strong> ${date}</td>
        </tr>
        <tr>
          <td><strong>Cliente:</strong> ${user.first_name} ${user.last_name}</td>
          <td style="text-align:right"><strong>Email:</strong> ${user.email}</td>
        </tr>
        ${
          address
            ? `<tr><td colspan="2"><strong>Dirección:</strong> ${address.street}, ${address.postcode} ${address.city}${address.province ? `, ${address.province}` : ""}</td></tr>`
            : ""
        }
      </table>
      ${orderItemsTable(order)}
      <p style="font-size:12px; color:#888; margin-top:24px;">Este documento sirve como factura simplificada de tu compra en Carnes Alhambra.</p>
    `),
  };
}

export function orderStatusEmail(
  order: { order_number: string },
  user: UserData,
  status: string,
) {
  const label = STATUS_LABELS[status] || status;

  return {
    subject: `Tu pedido ${order.order_number} — ${label}`,
    html: baseLayout(`
      <h2>Actualización de tu pedido</h2>
      <p>Hola ${user.first_name},</p>
      <p>El estado de tu pedido <strong>${order.order_number}</strong> ha cambiado a:</p>
      <p style="text-align:center; font-size:20px; margin:24px 0;">
        <strong class="highlight">${label}</strong>
      </p>
      ${status === "shipped" ? "<p>Tu pedido está en camino. ¡Prepárate para recibirlo!</p>" : ""}
      ${status === "delivered" ? "<p>Tu pedido ha sido entregado. ¡Buen provecho!</p>" : ""}
      ${status === "cancelled" ? "<p>Si no has solicitado esta cancelación, por favor contáctanos.</p>" : ""}
      <p><strong>El equipo de Carnes Alhambra</strong></p>
    `),
  };
}

export function reviewRequestEmail(
  order: { order_number: string },
  user: UserData,
) {
  return {
    subject: `¿Qué te pareció tu pedido ${order.order_number}?`,
    html: baseLayout(`
      <h2>¡Tu opinión nos importa!</h2>
      <p>Hola ${user.first_name},</p>
      <p>Esperamos que hayas disfrutado de tu pedido <strong>${order.order_number}</strong>.</p>
      <p>Nos encantaría conocer tu experiencia. Tu valoración nos ayuda a seguir mejorando.</p>
      <p style="text-align:center; margin: 28px 0;">
        <a class="btn" href="#">Valorar mi pedido</a>
      </p>
      <p>¡Gracias por tu confianza!<br><strong>El equipo de Carnes Alhambra</strong></p>
    `),
  };
}

export function campaignEmail(campaign: {
  title: string;
  body: string;
  image_url?: string;
  deep_link?: string;
}) {
  return {
    subject: campaign.title,
    html: baseLayout(`
      <h2>${campaign.title}</h2>
      ${campaign.image_url ? `<img src="${campaign.image_url}" alt="${campaign.title}" style="width:100%; max-width:560px; border-radius:8px; margin-bottom:16px;">` : ""}
      <p>${campaign.body}</p>
      ${
        campaign.deep_link
          ? `<p style="text-align:center; margin: 28px 0;"><a class="btn" href="${campaign.deep_link}">Ver más</a></p>`
          : ""
      }
    `),
  };
}

// ─── Admin notification templates ────────────────────

export function adminNewOrderEmail(
  order: { order_number: string; total: number; payment_method: string },
  user: UserData,
) {
  return {
    subject: `Nuevo pedido ${order.order_number}`,
    html: baseLayout(`
      <h2>Nuevo pedido recibido</h2>
      <table style="font-size:14px; margin:16px 0;">
        <tr><td style="padding:4px 12px 4px 0"><strong>Pedido:</strong></td><td>${order.order_number}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Cliente:</strong></td><td>${user.first_name} ${user.last_name} (${user.email})</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Total:</strong></td><td>${order.total.toFixed(2)} &euro;</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Pago:</strong></td><td>${order.payment_method}</td></tr>
      </table>
      <p>Accede al panel de administración para gestionar el pedido.</p>
    `),
  };
}

export function adminNewReviewEmail(
  review: { rating: number; comment?: string },
  user: UserData,
  order: { order_number: string },
) {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  return {
    subject: `Nueva valoración — ${order.order_number}`,
    html: baseLayout(`
      <h2>Nueva valoración recibida</h2>
      <table style="font-size:14px; margin:16px 0;">
        <tr><td style="padding:4px 12px 4px 0"><strong>Pedido:</strong></td><td>${order.order_number}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Cliente:</strong></td><td>${user.first_name} ${user.last_name}</td></tr>
        <tr><td style="padding:4px 12px 4px 0"><strong>Valoración:</strong></td><td style="font-size:18px; color:#e8c547">${stars}</td></tr>
        ${review.comment ? `<tr><td style="padding:4px 12px 4px 0"><strong>Comentario:</strong></td><td>${review.comment}</td></tr>` : ""}
      </table>
    `),
  };
}

export function adminErrorEmail(error: {
  message: string;
  stack?: string;
  url?: string;
  component?: string;
  userAgent?: string;
}) {
  return {
    subject: `[ERROR] Frontend: ${error.message.slice(0, 80)}`,
    html: baseLayout(`
      <h2 style="color:#e74c3c">Error en la aplicación</h2>
      <table style="font-size:14px; margin:16px 0; width:100%;">
        <tr><td style="padding:4px 12px 4px 0;vertical-align:top"><strong>Mensaje:</strong></td><td>${error.message}</td></tr>
        ${error.component ? `<tr><td style="padding:4px 12px 4px 0"><strong>Componente:</strong></td><td>${error.component}</td></tr>` : ""}
        ${error.url ? `<tr><td style="padding:4px 12px 4px 0"><strong>URL:</strong></td><td>${error.url}</td></tr>` : ""}
        ${error.userAgent ? `<tr><td style="padding:4px 12px 4px 0"><strong>User Agent:</strong></td><td style="font-size:12px">${error.userAgent}</td></tr>` : ""}
      </table>
      ${
        error.stack
          ? `<div style="background:#f8f8f8; padding:12px; border-radius:6px; overflow-x:auto; margin-top:12px;">
               <pre style="font-size:12px; margin:0; white-space:pre-wrap;">${error.stack}</pre>
             </div>`
          : ""
      }
      <p style="margin-top:16px; font-size:12px; color:#888;">Fecha: ${new Date().toLocaleString("es-ES")}</p>
    `),
  };
}
