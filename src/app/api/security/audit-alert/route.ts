import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userEmail, modifiedFields, targetUser } = body;

    const auditId = `AUD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    console.log(`[SECURITY AUDIT LOG] ${timestamp} | Action: ${action} | User: ${userEmail} | AuditID: ${auditId}`);
    console.log(`[SECURITY AUDIT DETAILS] Fields Modified:`, modifiedFields);

    // Simulated corporate email dispatch
    const emailSubject = `[Security Audit Notice] Account updates verified on Genesis for ${userEmail}`;
    const emailBody = `A security-verified modification was performed for account: ${userEmail}.
Action: ${action}
Timestamp: ${timestamp}
Audit Reference: ${auditId}
Modified Fields: ${JSON.stringify(modifiedFields, null, 2)}
Target User: ${targetUser || 'Self'}

If you did not authorize this change, please immediately contact security@genesis.internal.`;

    return NextResponse.json({
      success: true,
      auditId,
      timestamp,
      recipient: userEmail,
      subject: emailSubject,
      message: `Audit alert email dispatched successfully to ${userEmail}.`,
      modifiedFieldsSummary: modifiedFields,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch security audit alert' },
      { status: 500 }
    );
  }
}
