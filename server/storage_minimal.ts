// Minimal storage test to isolate syntax error
export interface IStorage {
  grantSchoolAdminRights(teacherId: number, schoolId: number, adminLevel: string, grantedBy: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async grantSchoolAdminRights(teacherId: number, schoolId: number, adminLevel: string, grantedBy: number): Promise<any> {
    return {};
  }
}