import { Router } from "express";
import { storage } from "../storage";
import { 
  insertBusinessPartnerSchema, 
  insertInternshipSchema, 
  insertSchoolPartnershipAgreementSchema,
  insertPartnershipCommunicationSchema
} from "../../shared/schema";
import { z } from "zod";

const router = Router();

// ===== BUSINESS PARTNERS ROUTES =====

// Get all business partners (optionally filtered by school)
router.get("/partners", async (req, res) => {
  try {
    const schoolId = req.query.schoolId ? parseInt(req.query.schoolId as string) : undefined;
    const partners = await storage.getBusinessPartners(schoolId);
    res.json(partners);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Get partners error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des partenaires",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// Get specific business partner
router.get("/partners/:id", async (req, res) => {
  try {
    const partnerId = parseInt(req.params.id);
    if (isNaN(partnerId)) {
      return res.status(400).json({ error: "ID partenaire invalide" });
    }
    
    const partner = await storage.getBusinessPartner(partnerId);
    if (!partner) {
      return res.status(404).json({ error: "Partenaire non trouvé" });
    }
    
    res.json(partner);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Get partner error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération du partenaire",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// Create new business partner
router.post("/partners", async (req, res) => {
  try {
    const validatedData = insertBusinessPartnerSchema.parse(req.body);
    const newPartner = await storage.createBusinessPartner(validatedData);
    res.status(201).json(newPartner);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Create partner error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Données invalides", 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: "Erreur lors de la création du partenaire",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// Update business partner
router.put("/partners/:id", async (req, res) => {
  try {
    const partnerId = parseInt(req.params.id);
    if (isNaN(partnerId)) {
      return res.status(400).json({ error: "ID partenaire invalide" });
    }
    
    const updates = req.body;
    const updatedPartner = await storage.updateBusinessPartner(partnerId, updates);
    
    if (!updatedPartner) {
      return res.status(404).json({ error: "Partenaire non trouvé" });
    }
    
    res.json(updatedPartner);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Update partner error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la mise à jour du partenaire",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// Delete business partner
router.delete("/partners/:id", async (req, res) => {
  try {
    const partnerId = parseInt(req.params.id);
    if (isNaN(partnerId)) {
      return res.status(400).json({ error: "ID partenaire invalide" });
    }
    
    await storage.deleteBusinessPartner(partnerId);
    res.status(204).send();
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Delete partner error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la suppression du partenaire",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// ===== PARTNERSHIP AGREEMENTS ROUTES =====

// Get partnership agreements for a school
router.get("/agreements", async (req, res) => {
  try {
    const schoolId = parseInt(req.query.schoolId as string);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: "ID école requis" });
    }
    
    const agreements = await storage.getSchoolPartnershipAgreements(schoolId);
    res.json(agreements);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Get agreements error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des accords",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// Create partnership agreement
router.post("/agreements", async (req, res) => {
  try {
    const validatedData = insertSchoolPartnershipAgreementSchema.parse(req.body);
    const newAgreement = await storage.createSchoolPartnershipAgreement(validatedData);
    res.status(201).json(newAgreement);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Create agreement error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Données invalides", 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: "Erreur lors de la création de l'accord",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// Update partnership agreement
router.put("/agreements/:id", async (req, res) => {
  try {
    const agreementId = parseInt(req.params.id);
    if (isNaN(agreementId)) {
      return res.status(400).json({ error: "ID accord invalide" });
    }
    
    const updates = req.body;
    const updatedAgreement = await storage.updateSchoolPartnershipAgreement(agreementId, updates);
    
    if (!updatedAgreement) {
      return res.status(404).json({ error: "Accord non trouvé" });
    }
    
    res.json(updatedAgreement);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Update agreement error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la mise à jour de l'accord",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// ===== INTERNSHIPS ROUTES =====

// Get internships for a school
router.get("/internships", async (req, res) => {
  try {
    const schoolId = parseInt(req.query.schoolId as string);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: "ID école requis" });
    }
    
    const filters = {
      status: req.query.status as string
    };
    
    const internships = await storage.getInternships(schoolId, filters);
    res.json(internships);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Get internships error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des stages",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// Get specific internship
router.get("/internships/:id", async (req, res) => {
  try {
    const internshipId = parseInt(req.params.id);
    if (isNaN(internshipId)) {
      return res.status(400).json({ error: "ID stage invalide" });
    }
    
    const internship = await storage.getInternship(internshipId);
    if (!internship) {
      return res.status(404).json({ error: "Stage non trouvé" });
    }
    
    res.json(internship);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Get internship error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération du stage",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// Create new internship
router.post("/internships", async (req, res) => {
  try {
    const validatedData = insertInternshipSchema.parse(req.body);
    const newInternship = await storage.createInternship(validatedData);
    res.status(201).json(newInternship);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Create internship error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Données invalides", 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: "Erreur lors de la création du stage",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// Update internship
router.put("/internships/:id", async (req, res) => {
  try {
    const internshipId = parseInt(req.params.id);
    if (isNaN(internshipId)) {
      return res.status(400).json({ error: "ID stage invalide" });
    }
    
    const updates = req.body;
    const updatedInternship = await storage.updateInternship(internshipId, updates);
    
    if (!updatedInternship) {
      return res.status(404).json({ error: "Stage non trouvé" });
    }
    
    res.json(updatedInternship);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Update internship error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la mise à jour du stage",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// Get student internships
router.get("/students/:studentId/internships", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ error: "ID étudiant invalide" });
    }
    
    const internships = await storage.getStudentInternships(studentId);
    res.json(internships);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Get student internships error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des stages étudiant",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// ===== COMMUNICATIONS ROUTES =====

// Send partnership communication
router.post("/communications", async (req, res) => {
  try {
    const validatedData = insertPartnershipCommunicationSchema.parse(req.body);
    const newCommunication = await storage.sendPartnershipCommunication(validatedData);
    res.status(201).json(newCommunication);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Send communication error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Données invalides", 
        details: error.errors 
      });
    }
    res.status(500).json({ 
      error: "Erreur lors de l'envoi de la communication",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// Get partnership communications
router.get("/communications", async (req, res) => {
  try {
    const agreementId = parseInt(req.query.agreementId as string);
    if (isNaN(agreementId)) {
      return res.status(400).json({ error: "ID accord requis" });
    }
    
    const communications = await storage.getPartnershipCommunications(agreementId);
    res.json(communications);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Get communications error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des communications",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

// ===== STATISTICS ROUTES =====

// Get partnership statistics for a school
router.get("/statistics", async (req, res) => {
  try {
    const schoolId = parseInt(req.query.schoolId as string);
    if (isNaN(schoolId)) {
      return res.status(400).json({ error: "ID école requis" });
    }
    
    const statistics = await storage.getPartnershipStatistics(schoolId);
    res.json(statistics);
  } catch (error) {
    console.error('[PARTNERSHIPS_API] Get statistics error:', error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération des statistiques",
      details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
});

export default router;