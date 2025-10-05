import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  TrendingUp, 
  Users, 
  BookOpen, 
  GraduationCap,
  Building,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Leaf,
  Award,
  Heart
} from 'lucide-react';

interface TestimonialData {
  id: string;
  name: string;
  role: string;
  school: string;
  location: string;
  rating: number;
  testimonial: string;
  statistics: {
    studentsImproved: number;
    paperSaved: number;
    timeEfficiency: number;
    costSaving: string;
  };
  avatar?: string;
  verified: boolean;
}

interface EnhancedTestimonialsProps {
  className?: string;
}

const EnhancedTestimonials: React.FC<EnhancedTestimonialsProps> = ({ className = '' }) => {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const text = {
    fr: {
      title: 'Témoignages de Réussite',
      subtitle: 'Découvrez comment Educafric transforme l\'éducation africaine avec des résultats mesurables',
      verified: 'Vérifié',
      rating: 'Note',
      location: 'Localisation',
      
      metrics: {
        studentsImproved: 'Élèves Améliorés',
        paperSaved: 'Papier Économisé',
        timeEfficiency: 'Efficacité Temps',
        costSaving: 'Économies Coût',
        sheets: 'feuilles',
        percent: '% d\'amélioration'
      },
      
      overall: {
        title: 'Impact Global Educafric',
        totalUsers: 'Utilisateurs Totaux',
        schoolsServed: 'Écoles Servies',
        paperSaved: 'Tonnes de Papier Économisées',
        averageImprovement: 'Amélioration Moyenne des Notes',
        satisfactionRate: 'Taux de Satisfaction'
      },
      
      cta: {
        viewAll: 'Voir Tous les Témoignages',
        joinSuccess: 'Rejoindre le Succès',
        getStarted: 'Commencer'
      }
    },
    
    en: {
      title: 'Success Stories',
      subtitle: 'Discover how Educafric transforms African education with measurable results',
      verified: 'Verified',
      rating: 'Rating',
      location: 'Location',
      
      metrics: {
        studentsImproved: 'Students Improved',
        paperSaved: 'Paper Saved',
        timeEfficiency: 'Time Efficiency',
        costSaving: 'Cost Savings',
        sheets: 'sheets',
        percent: '% improvement'
      },
      
      overall: {
        title: 'Educafric Global Impact',
        totalUsers: 'Total Users',
        schoolsServed: 'Schools Served',
        paperSaved: 'Tons of Paper Saved',
        averageImprovement: 'Average Grade Improvement',
        satisfactionRate: 'Satisfaction Rate'
      },
      
      cta: {
        viewAll: 'View All Testimonials',
        joinSuccess: 'Join the Success',
        getStarted: 'Get Started'
      }
    }
  };

  const t = text[language as keyof typeof text];

  const testimonials: TestimonialData[] = [
    {
      id: '1',
      name: 'Dr. Marie Kouame',
      role: 'Directrice',
      school: 'École Internationale de Yaoundé',
      location: 'Yaoundé, Cameroun',
      rating: 5,
      testimonial: language === 'fr' 
        ? 'Educafric a révolutionné notre gestion scolaire. Les parents sont plus impliqués, les enseignants plus efficaces, et nos résultats scolaires ont augmenté de 23% en seulement 6 mois.'
        : 'Educafric has revolutionized our school management. Parents are more involved, teachers more efficient, and our academic results increased by 23% in just 6 months.',
      statistics: {
        studentsImproved: 89,
        paperSaved: 2400,
        timeEfficiency: 45,
        costSaving: '300,000 CFA'
      },
      verified: true
    },
    {
      id: '2',
      name: 'Fatou Diallo',
      role: 'Parent',
      school: 'École Primaire Les Palmiers',
      location: 'Abidjan, Côte d\'Ivoire',
      rating: 5,
      testimonial: language === 'fr'
        ? 'Je peux suivre les progrès de mes trois enfants en temps réel. Plus de bulletins perdus, plus de surprises. La communication avec les enseignants est devenue si facile !'
        : 'I can track my three children\'s progress in real-time. No more lost report cards, no more surprises. Communication with teachers has become so easy!',
      statistics: {
        studentsImproved: 100,
        paperSaved: 180,
        timeEfficiency: 67,
        costSaving: '45,000 CFA'
      },
      verified: true
    },
    {
      id: '3',
      name: 'Prof. Ahmed Nasser',
      role: 'Enseignant de Mathématiques',
      school: 'Lycée Moderne de Douala',
      location: 'Douala, Cameroun',
      rating: 4,
      testimonial: language === 'fr'
        ? 'La correction automatique et les statistiques détaillées m\'aident à identifier rapidement les difficultés de mes élèves. C\'est un gain de temps énorme pour me concentrer sur la pédagogie.'
        : 'Automatic grading and detailed statistics help me quickly identify my students\' difficulties. It\'s a huge time saver to focus on pedagogy.',
      statistics: {
        studentsImproved: 76,
        paperSaved: 950,
        timeEfficiency: 52,
        costSaving: '120,000 CFA'
      },
      verified: true
    },
    {
      id: '4',
      name: 'Emmanuel Tchinda',
      role: 'Élève Terminal',
      school: 'Collège Saint-Joseph',
      location: 'Bafoussam, Cameroun',
      rating: 5,
      testimonial: language === 'fr'
        ? 'Educafric m\'a aidé à améliorer mes notes de 14/20 à 17/20 en utilisant les devoirs interactifs et le suivi personnalisé. Mes parents sont fiers de mes progrès !'
        : 'Educafric helped me improve my grades from 14/20 to 17/20 using interactive assignments and personalized tracking. My parents are proud of my progress!',
      statistics: {
        studentsImproved: 100,
        paperSaved: 85,
        timeEfficiency: 38,
        costSaving: '15,000 CFA'
      },
      verified: true
    }
  ];

  const overallStats = {
    totalUsers: 3547,
    schoolsServed: 67,
    paperSaved: 12.8,
    averageImprovement: 31,
    satisfactionRate: 96
  };

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % testimonials.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[currentSlide];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Award className="w-8 h-8 text-yellow-500" />
          <h2 className="text-4xl font-bold text-gray-900">{t.title}</h2>
          <Heart className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      {/* Overall Impact Statistics */}
      <Card className="bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-2xl">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
            <BarChart3 className="w-8 h-8" />
            {t.overall.title}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-blue-200 mr-2" />
                <span className="text-3xl font-bold">{overallStats.totalUsers.toLocaleString()}</span>
              </div>
              <p className="text-blue-100 text-sm">{t.overall.totalUsers}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Building className="w-6 h-6 text-green-200 mr-2" />
                <span className="text-3xl font-bold">{overallStats.schoolsServed}</span>
              </div>
              <p className="text-green-100 text-sm">{t.overall.schoolsServed}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Leaf className="w-6 h-6 text-green-300 mr-2" />
                <span className="text-3xl font-bold text-green-300">{overallStats.paperSaved}</span>
              </div>
              <p className="text-green-200 text-sm">{t.overall.paperSaved}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-yellow-300 mr-2" />
                <span className="text-3xl font-bold text-yellow-300">+{overallStats.averageImprovement}%</span>
              </div>
              <p className="text-yellow-200 text-sm">{t.overall.averageImprovement}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-yellow-400 mr-2" />
                <span className="text-3xl font-bold text-yellow-400">{overallStats.satisfactionRate}%</span>
              </div>
              <p className="text-yellow-200 text-sm">{t.overall.satisfactionRate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonial Carousel */}
      <div className="relative">
        <Card className="bg-white shadow-2xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Testimonial Content */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {currentTestimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                      {currentTestimonial.name}
                      {currentTestimonial.verified && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          ✓ {t.verified}
                        </Badge>
                      )}
                    </h3>
                    <p className="text-blue-600 font-semibold">{currentTestimonial.role}</p>
                    <p className="text-gray-600 text-sm">{currentTestimonial.school}</p>
                    <p className="text-gray-500 text-sm">📍 {currentTestimonial.location}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < currentTestimonial.rating 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {currentTestimonial.rating}/5 {t.rating}
                  </span>
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-lg text-gray-700 italic leading-relaxed border-l-4 border-blue-500 pl-6">
                  "{currentTestimonial.testimonial}"
                </blockquote>
              </div>

              {/* Right: Statistics */}
              <div className="space-y-6">
                <h4 className="text-xl font-bold text-gray-900 text-center mb-6">
                  📊 {language === 'fr' ? 'Résultats Mesurables' : 'Measurable Results'}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <GraduationCap className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-2xl font-bold text-green-700">
                          {currentTestimonial.statistics.studentsImproved}%
                        </span>
                      </div>
                      <p className="text-green-600 text-sm font-medium">
                        {t.metrics.studentsImproved}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Leaf className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-2xl font-bold text-blue-700">
                          {currentTestimonial.statistics.paperSaved}
                        </span>
                      </div>
                      <p className="text-blue-600 text-sm font-medium">
                        {t.metrics.paperSaved} ({t.metrics.sheets})
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="text-2xl font-bold text-purple-700">
                          {currentTestimonial.statistics.timeEfficiency}%
                        </span>
                      </div>
                      <p className="text-purple-600 text-sm font-medium">
                        {t.metrics.timeEfficiency}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <BookOpen className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="text-xl font-bold text-orange-700">
                          {currentTestimonial.statistics.costSaving}
                        </span>
                      </div>
                      <p className="text-orange-600 text-sm font-medium">
                        {t.metrics.costSaving}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Carousel Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    data-testid={`testimonial-dot-${index}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevSlide}
                  className="w-10 h-10 p-0"
                  data-testid="testimonial-prev"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextSlide}
                  className="w-10 h-10 p-0"
                  data-testid="testimonial-next"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-4">
            {language === 'fr' 
              ? '🚀 Prêt à Rejoindre Ces Histoires de Réussite ?' 
              : '🚀 Ready to Join These Success Stories?'
            }
          </h3>
          <p className="text-orange-100 mb-6 text-lg">
            {language === 'fr'
              ? 'Commencez votre transformation éducative dès aujourd\'hui et faites partie des témoignages de demain.'
              : 'Start your educational transformation today and become part of tomorrow\'s testimonials.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-orange-600 hover:bg-orange-50 px-8">
              {t.cta.getStarted}
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8">
              {t.cta.viewAll}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedTestimonials;