// Comprehensive notification system test utility
import { unifiedNotificationService } from '@/services/unifiedNotificationService';

export class NotificationTester {
  static async runComprehensiveTest(language: 'en' | 'fr' = 'en'): Promise<{
    success: boolean;
    results: Array<{ test: string; passed: boolean; error?: string }>;
  }> {
    const results: Array<{ test: string; passed: boolean; error?: string }> = [];
    
    // Test 1: Service instantiation
    try {
      const service = unifiedNotificationService;
      results.push({ test: 'Service instantiation', passed: true });
    } catch (error) {
      results.push({ test: 'Service instantiation', passed: false, error: String(error) });
    }

    // Test 2: Permission support
    try {
      const isSupported = unifiedNotificationService.isSupported();
      results.push({ test: 'Notification support check', passed: isSupported });
    } catch (error) {
      results.push({ test: 'Notification support check', passed: false, error: String(error) });
    }

    // Test 3: Permission request
    try {
      const hasPermission = await unifiedNotificationService.requestPermission();
      results.push({ test: 'Permission request', passed: true });
    } catch (error) {
      results.push({ test: 'Permission request', passed: false, error: String(error) });
    }

    // Test 4: Basic notifications
    try {
      await unifiedNotificationService.success('Test Success', 'Success notification test');
      results.push({ test: 'Success notification', passed: true });
    } catch (error) {
      results.push({ test: 'Success notification', passed: false, error: String(error) });
    }

    try {
      await unifiedNotificationService.error('Test Error', 'Error notification test');
      results.push({ test: 'Error notification', passed: true });
    } catch (error) {
      results.push({ test: 'Error notification', passed: false, error: String(error) });
    }

    try {
      await unifiedNotificationService.warning('Test Warning', 'Warning notification test');
      results.push({ test: 'Warning notification', passed: true });
    } catch (error) {
      results.push({ test: 'Warning notification', passed: false, error: String(error) });
    }

    try {
      await unifiedNotificationService.info('Test Info', 'Info notification test');
      results.push({ test: 'Info notification', passed: true });
    } catch (error) {
      results.push({ test: 'Info notification', passed: false, error: String(error) });
    }

    // Test 5: Educational notifications
    try {
      await unifiedNotificationService.grade('Test Student', 'Mathematics', '18/20', language);
      results.push({ test: 'Grade notification', passed: true });
    } catch (error) {
      results.push({ test: 'Grade notification', passed: false, error: String(error) });
    }

    try {
      await unifiedNotificationService.attendance('Test Student', 'present', language);
      results.push({ test: 'Attendance notification', passed: true });
    } catch (error) {
      results.push({ test: 'Attendance notification', passed: false, error: String(error) });
    }

    try {
      await unifiedNotificationService.homework('Science', 'tomorrow', language);
      results.push({ test: 'Homework notification', passed: true });
    } catch (error) {
      results.push({ test: 'Homework notification', passed: false, error: String(error) });
    }

    try {
      await unifiedNotificationService.emergency('Test emergency notification', language);
      results.push({ test: 'Emergency notification', passed: true });
    } catch (error) {
      results.push({ test: 'Emergency notification', passed: false, error: String(error) });
    }

    // Test 6: Test notification
    try {
      await unifiedNotificationService.test(language);
      results.push({ test: 'Test notification', passed: true });
    } catch (error) {
      results.push({ test: 'Test notification', passed: false, error: String(error) });
    }

    const allPassed = results.every(result => result.passed);
    
    return {
      success: allPassed,
      results
    };
  }

  static logResults(results: Array<{ test: string; passed: boolean; error?: string }>) {
    console.group('🧪 Notification System Test Results');
    
    results.forEach((result, index) => {
      const icon = result.passed ? '✅' : '❌';
      console.log(`${icon} ${index + 1}. ${result.test}`);
      if (!result.passed && result.error) {
        console.error(`   Error: ${result.error}`);
      }
    });

    const passedCount = (Array.isArray(results) ? results : []).filter(r => r.passed).length;
    const totalCount = (Array.isArray(results) ? results.length : 0);
    
    console.log(`\n📊 Summary: ${passedCount}/${totalCount} tests passed`);
    
    if (passedCount === totalCount) {
      console.log('🎉 All notification tests passed!');
    } else {
      console.warn('⚠️ Some notification tests failed. Check errors above.');
    }
    
    console.groupEnd();
  }
}

// Auto-test function for development
export const runNotificationTests = async (language: 'en' | 'fr' = 'en') => {
  const { success, results } = await NotificationTester.runComprehensiveTest(language);
  NotificationTester.logResults(results);
  return success;
};