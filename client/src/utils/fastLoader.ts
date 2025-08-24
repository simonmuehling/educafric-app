// Fast module loading utility for instant sandbox performance
export class FastLoader {
  private static cache = new Map<string, any>();
  private static preloadQueue: string[] = [];
  private static isLoading = false;

  // Fast preload for sandbox modules
  static async preloadSandboxModules(role: string) {
    const roleModules = {
      Parent: ['MyChildren', 'FunctionalParentGrades'],
      Student: ['FunctionalStudentGrades', 'StudentHomework'],
      Teacher: ['GradeManagement', 'ClassManagement'],
      Director: ['StudentManagement', 'TeacherManagement'],
      Admin: ['UserManagement', 'SystemSettings']
    };

    const modules = roleModules[role as keyof typeof roleModules] || [];
    
    // Load first module immediately
    if (modules.length > 0) {
      await this.loadModule(modules[0]);
    }
    
    // Queue others for background loading
    modules.slice(1).forEach(module => {
      this.preloadQueue.push(module);
    });
    
    this.processQueue();
  }

  private static async loadModule(moduleName: string) {
    if (this.cache.has(moduleName)) {
      return this.cache.get(moduleName);
    }

    try {
      // Dynamic import with caching (Vite optimized)
      const module = await import(/* @vite-ignore */ `@/components/${this.getModulePath(moduleName)}`);
      this.cache.set(moduleName, module.default);
      return module.default;
    } catch (error) {
      console.warn(`Fast loader: Module ${moduleName} not found`);
      return null;
    }
  }

  private static getModulePath(moduleName: string): string {
    const paths = {
      MyChildren: 'parent/modules/MyChildren',
      FunctionalParentGrades: 'parent/modules/FunctionalParentGrades',
      FunctionalStudentGrades: 'student/modules/FunctionalStudentGrades',
      StudentHomework: 'student/modules/StudentHomework',
      GradeManagement: 'teacher/modules/GradeManagement',
      ClassManagement: 'director/modules/ClassManagement',
      StudentManagement: 'director/modules/StudentManagement',
      TeacherManagement: 'director/modules/TeacherManagement'
    };
    
    return paths[moduleName as keyof typeof paths] || `shared/${moduleName}`;
  }

  private static async processQueue() {
    if (this.isLoading || this.preloadQueue.length === 0) return;
    
    this.isLoading = true;
    
    while (this.preloadQueue.length > 0) {
      const moduleName = this.preloadQueue.shift();
      if (moduleName && !this.cache.has(moduleName)) {
        await this.loadModule(moduleName);
        // Small delay to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    this.isLoading = false;
  }

  static getModule(moduleName: string) {
    return this.cache.get(moduleName);
  }

  static clearCache() {
    this.cache.clear();
    this.preloadQueue = [];
  }
}