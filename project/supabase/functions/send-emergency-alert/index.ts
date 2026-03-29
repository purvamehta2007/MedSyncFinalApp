import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface EmergencyAlertRequest {
  alertType: string;
  message: string;
  location: string;
  contacts: Array<{
    id: string;
    name: string;
    email: string;
    phone_number: string;
  }>;
  userInfo: {
    name: string;
    email: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { alertType, message, location, contacts, userInfo }: EmergencyAlertRequest = await req.json();

    const emailPromises = contacts.map(async (contact) => {
      const emailBody = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #14b8a6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
              .alert-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 16px 0; border-radius: 4px; }
              .info-row { margin: 12px 0; }
              .label { font-weight: bold; color: #4b5563; }
              .footer { background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">🚨 Emergency Alert from MedSync</h1>
              </div>
              <div class="content">
                <div class="alert-box">
                  <h2 style="margin-top: 0; color: #dc2626;">Emergency Alert</h2>
                  <p><strong>${userInfo.name}</strong> has triggered an emergency alert.</p>
                </div>

                <div class="info-row">
                  <span class="label">Alert Type:</span> ${alertType}
                </div>

                <div class="info-row">
                  <span class="label">Message:</span><br/>
                  ${message}
                </div>

                ${location ? `
                <div class="info-row">
                  <span class="label">Location:</span> ${location}
                </div>
                ` : ''}

                <div class="info-row">
                  <span class="label">Contact:</span> ${userInfo.email}
                </div>

                <div class="info-row">
                  <span class="label">Time:</span> ${new Date().toLocaleString()}
                </div>

                <p style="margin-top: 24px; padding: 16px; background: #dbeafe; border-radius: 4px;">
                  <strong>Action Required:</strong> Please check on ${userInfo.name} as soon as possible.
                </p>
              </div>
              <div class="footer">
                <p>This is an automated emergency alert from MedSync Health Management System</p>
                <p>You received this because you are listed as an emergency contact</p>
              </div>
            </div>
          </body>
        </html>
      `;

      console.log(`Would send email to ${contact.email}:`, {
        subject: `🚨 Emergency Alert from ${userInfo.name}`,
        to: contact.email,
        from: 'MedSync Alerts <alerts@medsync.app>',
        body: emailBody,
      });

      return {
        contactId: contact.id,
        email: contact.email,
        status: 'sent',
        timestamp: new Date().toISOString(),
      };
    });

    const results = await Promise.all(emailPromises);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Emergency alert notifications prepared for ${contacts.length} contact(s)`,
        results: results,
        note: 'For v0, emails are logged. Configure email service (Resend/SendGrid) for actual sending.',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in send-emergency-alert function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
