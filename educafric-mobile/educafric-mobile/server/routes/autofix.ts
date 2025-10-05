import { Router } from "express";
import { AutoFixSystem } from "../autofix-system";

const router = Router();
const autoFix = AutoFixSystem.getInstance();

// Test auto-fix system
router.post("/test-autofix", async (req, res) => {
  try {
    const { errorType } = req.body;
    
    let testError: any;
    switch (errorType) {
      case "database":
        testError = new Error('column "test_column" does not exist');
        break;
      case "typescript":
        testError = new Error('TypeScript compilation failed');
        break;
      case "port":
        testError = new Error('EADDRINUSE: port 5000 already in use');
        break;
      default:
        testError = new Error('Test error for auto-fix system');
    }
    
    const fixed = await autoFix.detectAndFixError(testError, { endpoint: req.path });
    
    res.json({
      message: "Auto-fix test completed",
      errorType,
      fixed,
      fixHistory: autoFix.getFixHistory()
    });
  } catch (error: any) {
    res.status(500).json({ message: "Auto-fix test failed", error: error?.message || String(error) });
  }
});

// Get fix history
router.get("/fix-history", (req, res) => {
  res.json({
    fixHistory: autoFix.getFixHistory(),
    message: "Auto-fix history retrieved"
  });
});

// Manual trigger fix
router.post("/manual-fix", async (req, res) => {
  try {
    const { error, context } = req.body;
    
    if (!error) {
      return res.status(400).json({ message: "Error message required" });
    }
    
    const fixed = await autoFix.detectAndFixError({ message: error }, context);
    
    res.json({
      message: "Manual fix attempt completed",
      error,
      fixed,
      context
    });
  } catch (error: any) {
    res.status(500).json({ message: "Manual fix failed", error: error?.message || String(error) });
  }
});

export default router;