// ===== EMAIL TEMPLATES MODULE =====
// Extracted from huge notificationService.ts to prevent crashes

export const EMAIL_TEMPLATES = {
  GRADE_REPORT: {
    en: {
      subject: (childName: string) => `Grade Report for ${childName}`,
      body: (childName: string, grades: any[]) => `
        <h2>Grade Report for ${childName}</h2>
        <p>Dear Parent,</p>
        <p>Here is the latest grade report for your child.</p>
        <!-- Grades will be populated here -->
        <p>Best regards,<br>School Administration</p>
      `
    },
    fr: {
      subject: (childName: string) => `Bulletin de notes pour ${childName}`,
      body: (childName: string, grades: any[]) => `
        <h2>Bulletin de notes pour ${childName}</h2>
        <p>Cher Parent,</p>
        <p>Voici le dernier bulletin de notes de votre enfant.</p>
        <!-- Les notes seront affichées ici -->
        <p>Cordialement,<br>Administration Scolaire</p>
      `
    }
  },

  ATTENDANCE_SUMMARY: {
    en: {
      subject: (childName: string) => `Attendance Summary - ${childName}`,
      body: (childName: string, summary: any) => `
        <h2>Attendance Summary for ${childName}</h2>
        <p>Dear Parent,</p>
        <p>Here is the attendance summary for your child.</p>
        <p>Best regards,<br>School Administration</p>
      `
    },
    fr: {
      subject: (childName: string) => `Résumé de présence - ${childName}`,
      body: (childName: string, summary: any) => `
        <h2>Résumé de présence pour ${childName}</h2>
        <p>Cher Parent,</p>
        <p>Voici le résumé de présence de votre enfant.</p>
        <p>Cordialement,<br>Administration Scolaire</p>
      `
    }
  }
};