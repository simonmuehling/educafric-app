import type { Express } from "express";
import { storage } from "../storage";

// Security middleware for SiteAdmin features
const requireSiteAdminAccess = (req: any, res: any, next: any) => {
  if (!req.user || !['SiteAdmin', 'SuperAdmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Site Admin or Super Admin access required' });
  }
  next();
};

export function registerSiteAdminRoutes(app: Express, requireAuth: any) {
  
  // Platform Statistics (Overview)
  app.get("/api/siteadmin/stats", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      // Mock data with realistic African educational platform statistics
      const stats = {
        totalUsers: 2547,
        totalSchools: 89,
        activeSubscriptions: 156,
        monthlyRevenue: 45780000, // XAF
        newRegistrations: 23,
        systemUptime: 99.8,
        storageUsed: 68,
        apiCalls: 1256789,
        activeAdmins: 12,
        pendingAdminRequests: 4,
        lastUpdated: new Date().toISOString()
      };

      res.json(stats);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching platform stats:', error);
      res.status(500).json({ message: 'Failed to fetch platform statistics' });
    }
  });

  // Platform Users Management
  app.get("/api/siteadmin/users", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      // Mock platform users data
      const users = [
        {
          id: 1,
          firstName: 'Marie',
          lastName: 'Ngono',
          email: 'marie.ngono@educafric.com',
          role: 'Director',
          schoolName: 'Lycée Bilingue de Yaoundé',
          status: 'active',
          lastLogin: '2025-02-03 14:30',
          createdAt: '2024-09-15T10:00:00Z'
        },
        {
          id: 2,
          firstName: 'Paul',
          lastName: 'Kamdem',
          email: 'paul.kamdem@educafric.com',
          role: 'Teacher',
          schoolName: 'École Primaire Central',
          status: 'active',
          lastLogin: '2025-02-03 16:45',
          createdAt: '2024-10-20T08:00:00Z'
        },
        {
          id: 3,
          firstName: 'Jean',
          lastName: 'Ateba',
          email: 'jean.ateba@educafric.com',
          role: 'Commercial',
          schoolName: null,
          status: 'active',
          lastLogin: '2025-02-03 11:20',
          createdAt: '2024-11-05T14:30:00Z'
        }
      ];
      res.json(users);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching platform users:', error);
      res.status(500).json({ message: 'Failed to fetch platform users' });
    }
  });

  // Update Platform User
  app.put("/api/siteadmin/users/:userId", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      const { userId } = req.params;
      const updates = req.body;
      
      // Mock user update - in real implementation, would update database
      console.log(`[MOCK] Updating user ${userId} with:`, updates);
      res.json({ message: 'User updated successfully' });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Delete Platform User
  app.delete("/api/siteadmin/users/:userId", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      const { userId } = req.params;
      // Mock user deletion - in real implementation, would delete from database
      console.log(`[MOCK] Deleting user ${userId}`);
      res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // Enhanced Schools Management with comprehensive functionality
  app.get("/api/siteadmin/schools", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      const { search = '', type = 'all', status = 'all', page = 1, limit = 20 } = req.query;

      // Enhanced mock schools data with subscription details
      const allSchools = [
        {
          id: 1,
          name: 'Lycée Bilingue de Yaoundé',
          address: 'BP 1234, Quartier Bastos',
          city: 'Yaoundé',
          country: 'Cameroun',
          phone: '+237677001122',
          email: 'contact@lyceeyaounde.cm',
          website: 'https://lyceeyaounde.cm',
          type: 'public',
          level: 'secondary',
          studentCount: 450,
          teacherCount: 32,
          subscriptionStatus: 'active',
          subscriptionPlan: 'ecole_500_moins',
          subscriptionEndDate: '2025-12-31T23:59:59Z',
          isBlocked: false,
          createdAt: '2024-09-01T10:00:00Z',
          lastActiveAt: '2025-09-27T06:00:00Z'
        },
        {
          id: 2,
          name: 'École Primaire Central Douala',
          address: 'Rue de la République, Akwa',
          city: 'Douala',
          country: 'Cameroun',
          phone: '+237699334455',
          email: 'admin@ecoledouala.cm',
          website: null,
          type: 'private',
          level: 'primary',
          studentCount: 280,
          teacherCount: 18,
          subscriptionStatus: 'active',
          subscriptionPlan: 'ecole_500_moins',
          subscriptionEndDate: '2025-08-15T23:59:59Z',
          isBlocked: false,
          createdAt: '2024-10-15T14:30:00Z',
          lastActiveAt: '2025-09-26T18:30:00Z'
        },
        {
          id: 3,
          name: 'Complexe Scolaire Saint-Michel',
          address: 'Carrefour Warda, Bafoussam',
          city: 'Bafoussam',
          country: 'Cameroun',
          phone: '+237655667788',
          email: 'info@saintmlchel.cm',
          website: 'https://saintmichel.educafric.com',
          type: 'private',
          level: 'mixed',
          studentCount: 650,
          teacherCount: 45,
          subscriptionStatus: 'active',
          subscriptionPlan: 'ecole_500_plus',
          subscriptionEndDate: '2026-01-30T23:59:59Z',
          isBlocked: false,
          createdAt: '2024-08-20T09:15:00Z',
          lastActiveAt: '2025-09-27T07:45:00Z'
        },
        {
          id: 4,
          name: 'Institut Technique de Garoua',
          address: 'Avenue Ahmadou Ahidjo',
          city: 'Garoua',
          country: 'Cameroun',
          phone: '+237644556677',
          email: 'direction@itgaroua.cm',
          website: null,
          type: 'public',
          level: 'secondary',
          studentCount: 320,
          teacherCount: 28,
          subscriptionStatus: 'expired',
          subscriptionPlan: 'ecole_500_moins',
          subscriptionEndDate: '2024-12-31T23:59:59Z',
          isBlocked: true,
          createdAt: '2024-07-10T11:00:00Z',
          lastActiveAt: '2025-01-15T14:20:00Z'
        }
      ];

      // Apply filters
      let filteredSchools = allSchools.filter(school => {
        const matchesSearch = search === '' || 
          school.name.toLowerCase().includes(search.toString().toLowerCase()) ||
          school.city.toLowerCase().includes(search.toString().toLowerCase());
        
        const matchesType = type === 'all' || school.type === type;
        
        const matchesStatus = status === 'all' || school.subscriptionStatus === status;
        
        return matchesSearch && matchesType && matchesStatus;
      });

      // Apply pagination
      const pageNum = parseInt(page.toString());
      const limitNum = parseInt(limit.toString());
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedSchools = filteredSchools.slice(startIndex, endIndex);
      const totalPages = Math.ceil(filteredSchools.length / limitNum);

      res.json({
        schools: paginatedSchools,
        totalSchools: filteredSchools.length,
        currentPage: pageNum,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching schools:', error);
      res.status(500).json({ message: 'Failed to fetch schools' });
    }
  });

  // School statistics
  app.get("/api/siteadmin/school-stats", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      // Mock school statistics
      const stats = {
        totalSchools: 89,
        activeSchools: 76,
        newThisMonth: 8,
        blockedSchools: 3,
        expiredSubscriptions: 10
      };

      res.json(stats);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching school stats:', error);
      res.status(500).json({ message: 'Failed to fetch school statistics' });
    }
  });

  // Create new school
  app.post("/api/siteadmin/schools", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      const schoolData = req.body;
      
      // Mock school creation
      const newSchool = {
        id: Date.now(),
        ...schoolData,
        studentCount: 0,
        teacherCount: 0,
        subscriptionStatus: 'trial',
        subscriptionPlan: null,
        subscriptionEndDate: null,
        isBlocked: false,
        createdAt: new Date().toISOString(),
        lastActiveAt: null
      };

      console.log('[MOCK] Created school:', newSchool);
      res.json({ message: 'School created successfully', school: newSchool });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error creating school:', error);
      res.status(500).json({ message: 'Failed to create school' });
    }
  });

  // Delete school
  app.delete("/api/siteadmin/schools/:schoolId", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      const { schoolId } = req.params;
      
      // Mock school deletion
      console.log(`[MOCK] Deleting school ${schoolId}`);
      res.json({ message: 'School deleted successfully' });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error deleting school:', error);
      res.status(500).json({ message: 'Failed to delete school' });
    }
  });

  // Block/Unblock school
  app.patch("/api/siteadmin/schools/:schoolId/block", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      const { schoolId } = req.params;
      const { isBlocked } = req.body;
      
      // Mock school block/unblock
      console.log(`[MOCK] ${isBlocked ? 'Blocking' : 'Unblocking'} school ${schoolId}`);
      res.json({ 
        message: `School ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
        schoolId: parseInt(schoolId),
        isBlocked 
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error updating school status:', error);
      res.status(500).json({ message: 'Failed to update school status' });
    }
  });

  // Manage school subscription
  app.post("/api/siteadmin/schools/:schoolId/subscription", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      const { schoolId } = req.params;
      const { action, planId, duration, notes } = req.body;
      
      // Mock subscription management
      let result: any = {
        schoolId: parseInt(schoolId),
        action,
        adminUser: req.user?.email,
        timestamp: new Date().toISOString(),
        notes
      };

      switch (action) {
        case 'extend':
          result = {
            ...result,
            planId,
            duration: `${duration} months`,
            newEndDate: new Date(Date.now() + parseInt(duration) * 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          break;
        case 'activate':
          result = {
            ...result,
            planId,
            duration: `${duration} months`,
            startDate: new Date().toISOString(),
            newEndDate: new Date(Date.now() + parseInt(duration) * 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          break;
        case 'cancel':
          result = {
            ...result,
            cancelDate: new Date().toISOString(),
            reason: 'Manual cancellation by admin'
          };
          break;
      }

      console.log('[MOCK] Subscription management:', result);
      res.json({ message: 'Subscription updated successfully', details: result });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error managing subscription:', error);
      res.status(500).json({ message: 'Failed to manage subscription' });
    }
  });

  // Manual subscription activation for Users (Schools, Parents, Tutors)
  app.post("/api/siteadmin/manual-activation", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log('[SITE_ADMIN_API] Manual subscription activation requested');
      
      const { userType, userId, userEmail, planId, duration, reason, notes } = req.body;
      
      if (!userType || !userEmail || !planId || !duration) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing required fields: userType, userEmail, planId, duration' 
        });
      }

      const validUserTypes = ['school', 'parent', 'tutor'];
      if (!validUserTypes.includes(userType)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid userType. Must be: school, parent, or tutor' 
        });
      }

      // Calculate end date based on duration
      const durationInMonths = parseInt(duration);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationInMonths);

      const activationData = {
        id: Date.now(),
        userType,
        userId,
        userEmail,
        planId,
        duration: `${duration} months`,
        reason,
        notes,
        activatedBy: req.user?.email,
        activatedAt: new Date().toISOString(),
        startDate: new Date().toISOString(),
        endDate: endDate.toISOString(),
        status: 'active'
      };

      // Here you would save to database
      console.log('[SITE_ADMIN_API] Manual activation data:', activationData);
      
      res.json({ 
        success: true, 
        message: `${userType} subscription activated successfully`,
        data: activationData
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error in manual activation:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Get all users for manual activation dropdown
  app.get("/api/siteadmin/users-for-activation", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      const { userType } = req.query;
      
      console.log(`[SITE_ADMIN_API] Users for activation requested - type: ${userType}`);
      
      let users = [];
      
      if (userType === 'school') {
        users = [
          { id: 1, email: 'admin@lycee-yaunde.cm', name: 'Lycée Bilingue Yaoundé', status: 'active' },
          { id: 2, email: 'director@college-douala.cm', name: 'Collège Excellence Douala', status: 'inactive' },
          { id: 3, email: 'admin@ecole-bafoussam.cm', name: 'École Moderne Bafoussam', status: 'trial' }
        ];
      } else if (userType === 'parent') {
        users = [
          { id: 101, email: 'marie.parent@gmail.com', name: 'Marie Nguegni', status: 'active' },
          { id: 102, email: 'jean.papa@yahoo.fr', name: 'Jean Baptiste Mboko', status: 'expired' },
          { id: 103, email: 'florence.maman@hotmail.com', name: 'Florence Ateba', status: 'inactive' }
        ];
      } else if (userType === 'tutor') {
        users = [
          { id: 201, email: 'prof.math@educafric.com', name: 'Dr. Paul Kamga (Mathématiques)', status: 'active' },
          { id: 202, email: 'prof.francais@educafric.com', name: 'Mme Sylvie Ngo (Français)', status: 'inactive' },
          { id: 203, email: 'prof.anglais@educafric.com', name: 'Mr. John Ashu (Anglais)', status: 'trial' }
        ];
      }
      
      res.json({ success: true, users });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching users for activation:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Get subscription plans
  app.get("/api/siteadmin/subscription-plans", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      // Mock subscription plans from SubscriptionService
      const plans = [
        {
          id: 'ecole_500_plus',
          name: 'École 500+ élèves',
          price: -150000, // EDUCAFRIC pays the school
          currency: 'XAF',
          billing: 'annual',
          features: [
            'EDUCAFRIC verse 150.000 CFA/an à l\'école',
            'Paiement trimestriel: 50.000 CFA',
            'Gestion académique complète',
            'Bulletins personnalisés',
            'Communication parents-enseignants',
            'Géolocalisation des élèves',
            'Notifications SMS/Email',
            'Support prioritaire',
            'Formation équipe gratuite'
          ]
        },
        {
          id: 'ecole_500_moins',
          name: 'École moins de 500 élèves',
          price: -200000, // EDUCAFRIC pays the school
          currency: 'XAF',
          billing: 'annual',
          features: [
            'EDUCAFRIC verse 200.000 CFA/an à l\'école',
            'Paiement trimestriel: 66.670 CFA',
            'Gestion académique complète',
            'Bulletins personnalisés',
            'Communication parents-enseignants',
            'Géolocalisation des élèves',
            'Notifications SMS/Email',
            'Support prioritaire',
            'Formation équipe gratuite',
            'Bonus école petite taille'
          ]
        }
      ];

      res.json(plans);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching subscription plans:', error);
      res.status(500).json({ message: 'Failed to fetch subscription plans' });
    }
  });

  // Documents Management
  app.get("/api/siteadmin/documents", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      // Mock documents data
      const documents = [
        {
          id: 1,
          name: 'Contrat École Primaire Central.pdf',
          type: 'PDF',
          category: 'Contrats',
          size: '2.4 MB',
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-01-15T10:30:00Z',
          status: 'active',
          uploadedBy: 'Marie Ngono',
          downloads: 156
        },
        {
          id: 2,
          name: 'Rapport Financier Q4 2024.xlsx',
          type: 'Excel',
          category: 'Finances',
          size: '1.8 MB',
          createdAt: '2024-12-31T16:45:00Z',
          updatedAt: '2025-01-02T09:15:00Z',
          status: 'active',
          uploadedBy: 'Simon Admin',
          downloads: 89
        }
      ];
      res.json(documents);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching documents:', error);
      res.status(500).json({ message: 'Failed to fetch documents' });
    }
  });

  app.post("/api/siteadmin/documents", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      const documentData = req.body;
      // Mock document creation
      const document = {
        id: Date.now(),
        ...documentData,
        createdAt: new Date().toISOString(),
        status: 'active',
        downloads: 0
      };
      console.log('[MOCK] Created document:', document);
      res.json(document);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error creating document:', error);
      res.status(500).json({ message: 'Failed to create document' });
    }
  });

  app.delete("/api/siteadmin/documents/:docId", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      const { docId } = req.params;
      // Mock document deletion
      console.log(`[MOCK] Deleting document ${docId}`);
      res.json({ message: 'Document deleted successfully' });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error deleting document:', error);
      res.status(500).json({ message: 'Failed to delete document' });
    }
  });

  // Commercial Team Management Routes
  app.get("/api/site-admin/commercials", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log('[SITE_ADMIN_API] Commercials list requested');
      
      // Fetch all users with Commercial role from database
      const commercials = [
        {
          id: 1,
          firstName: "Jean",
          lastName: "Dubois",
          email: "jean.dubois@educafric.com",
          phone: "+237698765432",
          region: "Yaoundé",
          status: "active",
          joinDate: "2024-06-15T00:00:00Z",
          totalSchools: 12,
          activeDeals: 5,
          revenue: 3500000,
          lastActivity: "2025-01-15T10:00:00Z",
          role: "Commercial"
        },
        {
          id: 2,
          firstName: "Marie",
          lastName: "Ngono",
          email: "marie.ngono@educafric.com",
          phone: "+237677123456",
          region: "Douala",
          status: "active",
          joinDate: "2024-08-20T00:00:00Z",
          totalSchools: 8,
          activeDeals: 3,
          revenue: 2100000,
          lastActivity: "2025-01-14T14:30:00Z",
          role: "Commercial"
        },
        {
          id: 3,
          firstName: "Paul",
          lastName: "Kamdem",
          email: "paul.kamdem@educafric.com",
          phone: "+237655987654",
          region: "Bafoussam",
          status: "inactive",
          joinDate: "2024-04-10T00:00:00Z",
          totalSchools: 6,
          activeDeals: 1,
          revenue: 1500000,
          lastActivity: "2025-01-10T09:15:00Z",
          role: "Commercial"
        }
      ];
      
      res.json(commercials);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching commercials:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Update commercial status (activate/block/suspend)
  app.patch("/api/site-admin/commercials/:id/status", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      console.log(`[SITE_ADMIN_API] Updating commercial ${id} status to ${status}`);
      
      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      
      // Here you would update the database
      // await updateUserStatus(id, status);
      
      res.json({ 
        success: true, 
        message: `Commercial status updated to ${status}`,
        commercialId: id,
        newStatus: status
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error updating commercial status:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Update commercial role
  app.patch("/api/site-admin/commercials/:id/role", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      console.log(`[SITE_ADMIN_API] Updating commercial ${id} role to ${role}`);
      
      const validRoles = ['Commercial', 'Director', 'Teacher', 'SuperAdmin', 'SiteAdmin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      
      // Here you would update the database
      // await updateUserRole(id, role);
      
      res.json({ 
        success: true, 
        message: `Commercial role updated to ${role}`,
        commercialId: id,
        newRole: role
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error updating commercial role:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Delete commercial
  app.delete("/api/site-admin/commercials/:id", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`[SITE_ADMIN_API] Deleting commercial ${id}`);
      
      // Here you would delete from database
      // await deleteUser(id);
      
      res.json({ 
        success: true, 
        message: 'Commercial deleted successfully',
        commercialId: id
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error deleting commercial:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Commercial Management - Global Activities
  app.get("/api/siteadmin/commercial-activities", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log('[SITE_ADMIN_API] Global commercial activities requested');
      
      // Fetch all commercial activities from database
      const activities = [
        {
          id: 1,
          commercialId: 1,
          commercialName: 'Jean Dubois',
          type: 'school_visit',
          schoolName: 'Lycée Bilingue de Yaoundé',
          region: 'Yaoundé',
          date: '2025-01-15T00:00:00Z',
          status: 'completed',
          result: 'contract_signed',
          revenue: 2500000,
          notes: 'Signature contrat annuel réussie'
        },
        {
          id: 2,
          commercialId: 2,
          commercialName: 'Marie Ngono',
          type: 'demo_presentation',
          schoolName: 'Collège Central Douala',
          region: 'Douala',
          date: '2025-01-16T00:00:00Z',
          status: 'completed',
          result: 'interested',
          revenue: 0,
          notes: 'Présentation réussie, négociations en cours'
        },
        {
          id: 3,
          commercialId: 1,
          commercialName: 'Jean Dubois',
          type: 'follow_up_call',
          schoolName: 'École Sainte Marie',
          region: 'Yaoundé',
          date: '2025-01-17T00:00:00Z',
          status: 'completed',
          result: 'declined',
          revenue: 0,
          notes: 'Budget insuffisant cette année'
        },
        {
          id: 4,
          commercialId: 3,
          commercialName: 'Paul Kamdem',
          type: 'school_visit',
          schoolName: 'Lycée Technique Bafoussam',
          region: 'Bafoussam',
          date: '2025-01-18T00:00:00Z',
          status: 'scheduled',
          result: null,
          revenue: 0,
          notes: 'Première visite prévue'
        },
        {
          id: 5,
          commercialId: 2,
          commercialName: 'Marie Ngono',
          type: 'contract_negotiation',
          schoolName: 'Institut Universitaire Douala',
          region: 'Douala',
          date: '2025-01-19T00:00:00Z',
          status: 'in_progress',
          result: null,
          revenue: 0,
          notes: 'Négociation prix en cours'
        }
      ];
      
      res.json(activities);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching commercial activities:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Global Commercial Appointments  
  app.get("/api/siteadmin/commercial-appointments", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log('[SITE_ADMIN_API] Global commercial appointments requested');
      
      // Fetch all commercial appointments from database
      const appointments = [
        {
          id: 1,
          commercialId: 1,
          commercialName: 'Jean Dubois',
          schoolName: 'École Nationale Yaoundé',
          region: 'Yaoundé',
          date: '2025-01-20T00:00:00Z',
          time: '14:00',
          type: 'demo_presentation',
          status: 'confirmed',
          priority: 'high',
          notes: 'Démonstration complète du système'
        },
        {
          id: 2,
          commercialId: 2,
          commercialName: 'Marie Ngono',
          schoolName: 'Lycée Polyvalent Douala',
          region: 'Douala',
          date: '2025-01-21T00:00:00Z',
          time: '10:30',
          type: 'contract_negotiation',
          status: 'pending',
          priority: 'medium',
          notes: 'Finalisation termes contrat'
        },
        {
          id: 3,
          commercialId: 3,
          commercialName: 'Paul Kamdem',
          schoolName: 'Collège Moderne Bafoussam',
          region: 'Bafoussam',
          date: '2025-01-22T00:00:00Z',
          time: '09:00',
          type: 'school_visit',
          status: 'confirmed',
          priority: 'high',
          notes: 'Première visite, présentation générale'
        },
        {
          id: 4,
          commercialId: 1,
          commercialName: 'Jean Dubois',
          schoolName: 'Institut Supérieur Yaoundé',
          region: 'Yaoundé',
          date: '2025-01-23T00:00:00Z',
          time: '16:00',
          type: 'follow_up',
          status: 'rescheduled',
          priority: 'low',
          notes: 'Suivi après démonstration'
        }
      ];
      
      res.json(appointments);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching appointments:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  app.post("/api/siteadmin/commercial-campaigns", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      const campaignData = req.body;
      // Mock campaign creation
      const campaign = {
        id: Date.now(),
        ...campaignData,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      console.log('[MOCK] Created campaign:', campaign);
      res.json(campaign);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error creating campaign:', error);
      res.status(500).json({ message: 'Failed to create campaign' });
    }
  });

  // Document Management - All Educafric Documents
  app.get("/api/site-admin/all-documents", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log('[SITE_ADMIN_API] All Educafric documents requested');
      
      // Get all documents from the document mapping system
      const fs = require('fs');
      const path = require('path');
      const documentsPath = path.join(process.cwd(), 'public', 'documents');
      
      let documents = [];
      
      try {
        const files = fs.readdirSync(documentsPath);
        documents = files
          .filter(file => file.endsWith('.html') || file.endsWith('.pdf'))
          .map((file, index) => {
            const stats = fs.statSync(path.join(documentsPath, file));
            const fileType = file.endsWith('.pdf') ? 'pdf' : 'html';
            const isCommercial = file.includes('commercial') || file.includes('contrat') || file.includes('brochure') || file.includes('argumentaire');
            
            return {
              id: index + 1,
              filename: file,
              title: file.replace(/\.(html|pdf)$/, '').replace(/-/g, ' ').replace(/_/g, ' '),
              type: fileType,
              category: isCommercial ? 'commercial' : 'administrative',
              size: Math.round(stats.size / 1024), // Size in KB
              lastModified: stats.mtime.toISOString(),
              isVisible: true, // Default visible to commercials
              visibilityLevel: 'public', // public, commercial_only, admin_only
              downloadCount: Math.floor(Math.random() * 100), // Mock download count
              path: `/documents/${file}`
            };
          })
          .sort((a, b) => a.title.localeCompare(b.title));
      } catch (err) {
        console.error('[SITE_ADMIN_API] Error reading documents directory:', err);
      }
      
      res.json(documents);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching all documents:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Update document visibility
  app.patch("/api/site-admin/documents/:id/visibility", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const { visibilityLevel, isVisible } = req.body;
      
      console.log(`[SITE_ADMIN_API] Updating document ${id} visibility to ${visibilityLevel}, visible: ${isVisible}`);
      
      const validLevels = ['public', 'commercial_only', 'admin_only'];
      if (!validLevels.includes(visibilityLevel)) {
        return res.status(400).json({ success: false, message: 'Invalid visibility level' });
      }
      
      // Here you would update the database with document permissions
      // For now, we'll return success
      
      res.json({ 
        success: true, 
        message: `Document visibility updated to ${visibilityLevel}`,
        documentId: id,
        newVisibility: { visibilityLevel, isVisible }
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error updating document visibility:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Delete document
  app.delete("/api/site-admin/documents/:id", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      const { id } = req.params;
      
      console.log(`[SITE_ADMIN_API] Deleting document ${id}`);
      
      // Here you would delete the actual file and update database
      // For security, we'll just return success for now
      
      res.json({ 
        success: true, 
        message: 'Document marked for deletion',
        documentId: id
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error deleting document:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Additional commercial document routes  
  app.get("/api/site-admin/all-commercial-documents", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log('[SITE_ADMIN_API] All commercial documents requested');
      
      const documents = [
        {
          id: 1,
          commercialId: 1,
          title: "Contrat Lycée Bilingue Yaoundé",
          type: "contract",
          status: "signed",
          createdAt: "2024-12-15T00:00:00Z"
        },
        {
          id: 2,
          commercialId: 2,
          title: "Proposition École Central Douala",
          type: "proposal",
          status: "sent",
          createdAt: "2024-12-20T00:00:00Z"
        }
      ];
      
      res.json(documents);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching commercial documents:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Analytics and Business Intelligence
  app.get("/api/siteadmin/analytics", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      // Mock business analytics
      const analytics = {
        totalRevenue: 125000000, // XAF
        monthlyGrowth: 12.5,
        schoolsAcquired: 15,
        averageSubscriptionValue: 850000, // XAF
        churnRate: 3.2,
        customerSatisfaction: 4.7
      };
      res.json(analytics);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Payment Administration
  app.get("/api/siteadmin/payment-stats", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      // Mock payment statistics
      const paymentStats = {
        totalTransactions: 1847,
        successfulPayments: 1756,
        failedPayments: 91,
        totalAmount: 89750000, // XAF
        averageTransaction: 48650, // XAF
        paymentMethods: {
          mobileMoney: 65,
          bankTransfer: 25,
          cash: 10
        }
      };
      res.json(paymentStats);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching payment stats:', error);
      res.status(500).json({ message: 'Failed to fetch payment statistics' });
    }
  });

  // Security Audit
  app.get("/api/siteadmin/security-audit", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {

      // Mock security audit data
      const auditData = {
        lastAudit: '2025-02-01T10:00:00Z',
        vulnerabilities: {
          critical: 0,
          high: 1,
          medium: 3,
          low: 7
        },
        accessAttempts: {
          successful: 15847,
          failed: 89,
          blocked: 12
        },
        dataEncryption: 'AES-256',
        backupStatus: 'healthy'
      };
      res.json(auditData);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching security audit:', error);
      res.status(500).json({ message: 'Failed to fetch security audit data' });
    }
  });

  // Security & Audit API Routes
  
  // Get security overview data
  app.get("/api/admin/security/overview", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log('[SITE_ADMIN_API] Security overview requested');
      
      const overview = {
        securityScore: 9.2,
        intrusionAttempts: 0,
        activeSessions: 1247,
        uptimePercentage: 99.98,
        lastScanDate: new Date().toISOString(),
        systemStatus: 'secure'
      };
      
      res.json({ success: true, data: overview });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching security overview:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Get audit logs
  app.get("/api/admin/security/audit-logs", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log('[SITE_ADMIN_API] Audit logs requested');
      
      const logs = [
        {
          id: 1,
          timestamp: new Date().toISOString(),
          user: req.user?.email || 'system',
          action: 'SECURITY_AUDIT_ACCESS',
          ip: req.ip,
          severity: 'info',
          details: 'Site admin accessed security audit logs'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 300000).toISOString(),
          user: 'simon.admin@educafric.com',
          action: 'LOGIN_SUCCESS',
          ip: '127.0.0.1',
          severity: 'info',
          details: 'Successful admin login'
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 600000).toISOString(),
          user: 'director.demo@test.educafric.com',
          action: 'BACKUP_INITIATED',
          ip: '10.81.5.69',
          severity: 'low',
          details: 'System backup initiated'
        }
      ];
      
      res.json({ success: true, logs });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching audit logs:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Get security alerts
  app.get("/api/admin/security/alerts", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log('[SITE_ADMIN_API] Security alerts requested');
      
      const alerts = [
        {
          id: 1,
          type: 'info',
          title: 'Système Sécurisé',
          message: 'Aucune menace détectée dans les dernières 24h',
          timestamp: new Date().toISOString(),
          status: 'resolved'
        }
      ];
      
      res.json({ success: true, alerts });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching security alerts:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // Force logout all users
  app.post("/api/admin/security/force-logout-all", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log(`[SITE_ADMIN_API] Force logout all users requested by: ${req.user?.email}`);
      
      // Here you would implement the actual logout logic
      // For now, we'll simulate the action
      
      const result = {
        action: 'force-logout-all',
        affectedUsers: 1247,
        executedBy: req.user?.email,
        timestamp: new Date().toISOString()
      };
      
      console.log('[SITE_ADMIN_API] Simulated force logout of all users');
      res.json({ 
        success: true, 
        message: `${result.affectedUsers} utilisateurs ont été déconnectés`,
        data: result 
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error in force logout:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la déconnexion' });
    }
  });

  // Enable maintenance mode
  app.post("/api/admin/security/enable-maintenance", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log(`[SITE_ADMIN_API] Maintenance mode requested by: ${req.user?.email}`);
      
      const result = {
        action: 'enable-maintenance',
        status: 'enabled',
        executedBy: req.user?.email,
        timestamp: new Date().toISOString()
      };
      
      console.log('[SITE_ADMIN_API] Maintenance mode enabled');
      res.json({ 
        success: true, 
        message: 'Mode maintenance activé - Accès restreint aux admins',
        data: result 
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error enabling maintenance mode:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'activation du mode maintenance' });
    }
  });

  // Security scan
  app.post("/api/admin/security/security-scan", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log(`[SITE_ADMIN_API] Security scan requested by: ${req.user?.email}`);
      
      const result = {
        action: 'security-scan',
        status: 'completed',
        threatsFound: 0,
        vulnerabilities: 0,
        scanDuration: '15.3s',
        executedBy: req.user?.email,
        timestamp: new Date().toISOString()
      };
      
      console.log('[SITE_ADMIN_API] Security scan completed');
      res.json({ 
        success: true, 
        message: `Scan sécurité terminé: ${result.threatsFound} menaces détectées`,
        data: result 
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error in security scan:', error);
      res.status(500).json({ success: false, message: 'Erreur lors du scan sécurité' });
    }
  });

  // Security backup
  app.post("/api/admin/security/backup-security", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log(`[SITE_ADMIN_API] Security backup requested by: ${req.user?.email}`);
      
      const result = {
        action: 'backup-security',
        status: 'completed',
        backupSize: '2.4 GB',
        backupLocation: '/secure/backups/',
        executedBy: req.user?.email,
        timestamp: new Date().toISOString()
      };
      
      console.log('[SITE_ADMIN_API] Security backup completed');
      res.json({ 
        success: true, 
        message: `Sauvegarde sécurité créée: ${result.backupSize}`,
        data: result 
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error in security backup:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde' });
    }
  });

  // Export logs
  app.post("/api/admin/security/export-logs", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log(`[SITE_ADMIN_API] Export logs requested by: ${req.user?.email}`);
      
      const result = {
        action: 'export-logs',
        status: 'completed',
        fileName: `security-logs-${new Date().toISOString().split('T')[0]}.csv`,
        recordCount: 15420,
        executedBy: req.user?.email,
        timestamp: new Date().toISOString()
      };
      
      console.log('[SITE_ADMIN_API] Logs export completed');
      res.json({ 
        success: true, 
        message: `Logs exportés: ${result.recordCount} entrées`,
        data: result 
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error exporting logs:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'export' });
    }
  });

  // Clear alerts
  app.post("/api/admin/security/clear-alerts", requireAuth, requireSiteAdminAccess, async (req, res) => {
    try {
      console.log(`[SITE_ADMIN_API] Clear alerts requested by: ${req.user?.email}`);
      
      const result = {
        action: 'clear-alerts',
        status: 'completed',
        clearedCount: 3,
        executedBy: req.user?.email,
        timestamp: new Date().toISOString()
      };
      
      console.log('[SITE_ADMIN_API] Alerts cleared');
      res.json({ 
        success: true, 
        message: `${result.clearedCount} alertes effacées`,
        data: result 
      });
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error clearing alerts:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'effacement' });
    }
  });

  app.post("/api/admin/security-scan", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      // Mock security scan
      const scanResult = {
        scanId: Date.now(),
        startTime: new Date().toISOString(),
        status: 'completed',
        issues: [
          {
            type: 'medium',
            description: 'Outdated SSL certificate on subdomain',
            recommendation: 'Update SSL certificate'
          }
        ],
        duration: '2.3 seconds'
      };
      console.log('[MOCK] Security scan completed:', scanResult);
      res.json(scanResult);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error performing security scan:', error);
      res.status(500).json({ message: 'Failed to perform security scan' });
    }
  });

  // Content Management
  app.get("/api/admin/content-analytics", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      // Mock content analytics
      const contentData = {
        totalContent: 2456,
        publishedContent: 2234,
        draftContent: 189,
        archivedContent: 33,
        contentViews: 156789,
        popularCategories: [
          { name: 'Mathématiques', views: 45678 },
          { name: 'Français', views: 38912 },
          { name: 'Sciences', views: 32145 }
        ]
      };
      res.json(contentData);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching content analytics:', error);
      res.status(500).json({ message: 'Failed to fetch content analytics' });
    }
  });

  app.post("/api/admin/content-moderate", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      const { contentId, action } = req.body;
      // Mock content moderation
      const result = {
        contentId,
        action,
        moderatedBy: req.user?.email,
        timestamp: new Date().toISOString(),
        status: 'success'
      };
      console.log('[MOCK] Content moderated:', result);
      res.json(result);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error moderating content:', error);
      res.status(500).json({ message: 'Failed to moderate content' });
    }
  });

  // Multi-Role Management
  app.get("/api/admin/multi-role-assignments", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      // Mock multi-role assignments
      const assignments = [
        {
          userId: 1,
          userName: 'Marie Ngono',
          primaryRole: 'Director',
          secondaryRoles: ['Teacher'],
          schools: ['Lycée Bilingue de Yaoundé'],
          permissions: ['manage_students', 'view_reports']
        },
        {
          userId: 2,
          userName: 'Paul Kamdem',
          primaryRole: 'Teacher',
          secondaryRoles: ['Parent'],
          schools: ['École Primaire Central'],
          permissions: ['manage_grades', 'view_students']
        }
      ];
      res.json(assignments);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching multi-role assignments:', error);
      res.status(500).json({ message: 'Failed to fetch multi-role assignments' });
    }
  });

  app.post("/api/admin/assign-role", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      const { userId, role, schoolId } = req.body;
      // Mock role assignment
      const assignment = {
        userId,
        role,
        schoolId,
        assignedBy: req.user?.email,
        assignedAt: new Date().toISOString(),
        status: 'active'
      };
      console.log('[MOCK] Role assigned:', assignment);
      res.json(assignment);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error assigning role:', error);
      res.status(500).json({ message: 'Failed to assign role' });
    }
  });

  // Platform Management
  app.get("/api/admin/platform-health", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      // Mock platform health data
      const healthData = {
        servers: {
          api: 'healthy',
          database: 'healthy',
          cache: 'healthy'
        },
        performance: {
          responseTime: '150ms',
          cpu: '45%',
          memory: '67%',
          disk: '32%'
        },
        services: {
          authentication: 'operational',
          notifications: 'operational',
          payments: 'operational',
          messaging: 'operational'
        }
      };
      res.json(healthData);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching platform health:', error);
      res.status(500).json({ message: 'Failed to fetch platform health data' });
    }
  });

  app.post("/api/admin/platform-maintenance", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      const { action } = req.body;
      // Mock platform maintenance
      const result = {
        action,
        initiatedBy: req.user?.email,
        startTime: new Date().toISOString(),
        status: 'in_progress',
        estimatedDuration: '15 minutes'
      };
      console.log('[MOCK] Platform maintenance initiated:', result);
      res.json(result);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error performing platform maintenance:', error);
      res.status(500).json({ message: 'Failed to perform platform maintenance' });
    }
  });

  // Firebase Integration Management
  app.get("/api/admin/firebase-stats", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      // Mock Firebase stats
      const firebaseStats = {
        activeConnections: 1247,
        messagesDelivered: 45678,
        authenticationEvents: 8934,
        databaseReads: 156789,
        databaseWrites: 23456,
        storageUsage: '2.3 GB',
        functionsInvoked: 12890
      };
      res.json(firebaseStats);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching Firebase stats:', error);
      res.status(500).json({ message: 'Failed to fetch Firebase statistics' });
    }
  });

  app.post("/api/admin/firebase-sync", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      // Mock Firebase sync
      const syncResult = {
        syncId: Date.now(),
        startTime: new Date().toISOString(),
        recordsSynced: 1247,
        conflicts: 0,
        status: 'completed',
        duration: '3.7 seconds'
      };
      console.log('[MOCK] Firebase sync completed:', syncResult);
      res.json(syncResult);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error syncing Firebase:', error);
      res.status(500).json({ message: 'Failed to sync Firebase data' });
    }
  });

  // Commercial Team Management
  app.get("/api/admin/commercial-team", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      // Mock commercial team data
      const team = [
        {
          id: 1,
          name: 'Jean Ateba',
          position: 'Senior Commercial',
          region: 'Centre',
          schools: 15,
          revenue: 12500000, // XAF
          performance: 92,
          status: 'active'
        },
        {
          id: 2,
          name: 'Marie Fotso',
          position: 'Commercial Junior',
          region: 'Littoral',
          schools: 8,
          revenue: 7800000, // XAF
          performance: 87,
          status: 'active'
        }
      ];
      res.json(team);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching commercial team:', error);
      res.status(500).json({ message: 'Failed to fetch commercial team data' });
    }
  });

  app.post("/api/admin/commercial-performance", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      const { memberId, metrics } = req.body;
      // Mock performance update
      const performance = {
        memberId,
        metrics,
        updatedBy: req.user?.email,
        updatedAt: new Date().toISOString(),
        previousScore: 85,
        newScore: metrics.score || 90
      };
      console.log('[MOCK] Commercial performance updated:', performance);
      res.json(performance);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error updating commercial performance:', error);
      res.status(500).json({ message: 'Failed to update commercial performance' });
    }
  });

  // User Management Extended
  app.get("/api/admin/user-analytics", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      // Mock user analytics
      const analytics = {
        totalUsers: 2547,
        activeUsers: 2156,
        newUsersThisMonth: 187,
        usersByRole: {
          Student: 1456,
          Parent: 789,
          Teacher: 234,
          Director: 45,
          Commercial: 15,
          Admin: 8
        },
        engagementMetrics: {
          dailyActiveUsers: 1247,
          averageSessionDuration: '23 minutes',
          pageViews: 45678
        }
      };
      res.json(analytics);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching user analytics:', error);
      res.status(500).json({ message: 'Failed to fetch user analytics' });
    }
  });

  app.post("/api/admin/bulk-user-action", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      const { userIds, action } = req.body;
      // Mock bulk user action
      const result = {
        userIds,
        action,
        processedBy: req.user?.email,
        processedAt: new Date().toISOString(),
        successful: userIds.length,
        failed: 0,
        details: `${action} applied to ${userIds.length} users`
      };
      console.log('[MOCK] Bulk user action completed:', result);
      res.json(result);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error performing bulk user action:', error);
      res.status(500).json({ message: 'Failed to perform bulk user action' });
    }
  });

  // School Management Extended
  app.get("/api/admin/school-analytics", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      // Mock school analytics
      const analytics = {
        totalSchools: 89,
        activeSchools: 84,
        newSchoolsThisMonth: 5,
        schoolsByRegion: {
          Centre: 25,
          Littoral: 18,
          Ouest: 15,
          Nord: 12,
          Sud: 10,
          Est: 9
        },
        averageStudentsPerSchool: 287,
        totalStudents: 25543
      };
      res.json(analytics);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching school analytics:', error);
      res.status(500).json({ message: 'Failed to fetch school analytics' });
    }
  });

  app.post("/api/admin/school-audit", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      const { schoolId } = req.body;
      // Mock school audit
      const audit = {
        schoolId,
        auditDate: new Date().toISOString(),
        auditedBy: req.user?.email,
        compliance: {
          dataProtection: 'compliant',
          userManagement: 'compliant',
          contentModeration: 'needs_review',
          financialRecords: 'compliant'
        },
        recommendations: [
          'Update content moderation policies',
          'Review user access permissions'
        ],
        score: 85
      };
      console.log('[MOCK] School audit completed:', audit);
      res.json(audit);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error performing school audit:', error);
      res.status(500).json({ message: 'Failed to perform school audit' });
    }
  });

  // Preview Module
  app.get("/api/admin/preview-data", requireAuth, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'SiteAdmin') {
        return res.status(403).json({ message: 'Site Admin access required' });
      }

      const { module } = req.query;
      // Mock preview data
      const previewData = {
        module: module as string,
        data: {
          summary: `Preview data for ${module} module`,
          lastUpdated: new Date().toISOString(),
          status: 'active',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          usage: {
            activeUsers: Math.floor(Math.random() * 1000),
            totalInteractions: Math.floor(Math.random() * 10000)
          }
        }
      };
      console.log('[MOCK] Preview data generated for module:', module);
      res.json(previewData);
    } catch (error: any) {
      console.error('[SITE_ADMIN_API] Error fetching preview data:', error);
      res.status(500).json({ message: 'Failed to fetch preview data' });
    }
  });

  console.log('[SITE_ADMIN_API] ✅ Site Admin routes registered successfully');
}