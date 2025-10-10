import { useLanguage } from '@/contexts/LanguageContext';
import { Building2, Users, Globe, Award, Target, Heart } from 'lucide-react';

export default function About() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'About Educafric',
      subtitle: 'Transforming Education Across Africa',
      mission: 'Our Mission',
      missionText: 'To democratize quality education across Africa by providing innovative, accessible, and affordable digital learning solutions that empower schools, teachers, parents, and students.',
      vision: 'Our Vision',
      visionText: 'To become Africa\'s leading educational technology platform, bridging the digital divide and creating equal opportunities for all learners across the continent.',
      company: 'Our Company',
      companyText: 'Educafric is operated by Afro Metaverse Marketing Sarl (RC/YAE/2023/B1361), a registered company committed to revolutionizing education in Africa through technology. Founded with a vision to make quality education accessible to all, we combine cutting-edge technology with deep understanding of African educational needs.',
      values: 'Our Values',
      valuesList: [
        {
          title: 'Innovation',
          description: 'Constantly evolving our platform to meet the changing needs of African education',
          icon: Target
        },
        {
          title: 'Accessibility',
          description: 'Making quality education tools available to everyone, regardless of location or resources',
          icon: Globe
        },
        {
          title: 'Excellence',
          description: 'Delivering world-class educational technology designed specifically for Africa',
          icon: Award
        },
        {
          title: 'Community',
          description: 'Building strong partnerships with schools, educators, and families across the continent',
          icon: Heart
        }
      ],
      stats: 'Our Impact',
      statsList: [
        { value: '500+', label: 'Schools' },
        { value: '10,000+', label: 'Teachers' },
        { value: '100,000+', label: 'Students' },
        { value: '15+', label: 'Countries' }
      ],
      contact: 'Get in Touch',
      contactText: 'Want to learn more about how Educafric can transform education at your institution?',
      email: 'Email: info@educafric.com',
      phone: 'Phone: +237 656 200 472',
      location: 'Location: Yaoundé, Cameroon'
    },
    fr: {
      title: 'À Propos d\'Educafric',
      subtitle: 'Transformer l\'Éducation à Travers l\'Afrique',
      mission: 'Notre Mission',
      missionText: 'Démocratiser une éducation de qualité à travers l\'Afrique en fournissant des solutions d\'apprentissage numérique innovantes, accessibles et abordables qui autonomisent les écoles, les enseignants, les parents et les élèves.',
      vision: 'Notre Vision',
      visionText: 'Devenir la plateforme de technologie éducative leader en Afrique, comblant la fracture numérique et créant des opportunités égales pour tous les apprenants du continent.',
      company: 'Notre Entreprise',
      companyText: 'Educafric est exploité par Afro Metaverse Marketing Sarl (RC/YAE/2023/B1361), une entreprise enregistrée engagée à révolutionner l\'éducation en Afrique grâce à la technologie. Fondée avec la vision de rendre l\'éducation de qualité accessible à tous, nous combinons technologie de pointe et compréhension approfondie des besoins éducatifs africains.',
      values: 'Nos Valeurs',
      valuesList: [
        {
          title: 'Innovation',
          description: 'Faire évoluer constamment notre plateforme pour répondre aux besoins changeants de l\'éducation africaine',
          icon: Target
        },
        {
          title: 'Accessibilité',
          description: 'Rendre les outils éducatifs de qualité disponibles pour tous, quel que soit l\'emplacement ou les ressources',
          icon: Globe
        },
        {
          title: 'Excellence',
          description: 'Fournir une technologie éducative de classe mondiale conçue spécifiquement pour l\'Afrique',
          icon: Award
        },
        {
          title: 'Communauté',
          description: 'Construire des partenariats solides avec les écoles, les éducateurs et les familles à travers le continent',
          icon: Heart
        }
      ],
      stats: 'Notre Impact',
      statsList: [
        { value: '500+', label: 'Écoles' },
        { value: '10 000+', label: 'Enseignants' },
        { value: '100 000+', label: 'Élèves' },
        { value: '15+', label: 'Pays' }
      ],
      contact: 'Contactez-nous',
      contactText: 'Vous souhaitez en savoir plus sur comment Educafric peut transformer l\'éducation dans votre institution ?',
      email: 'Email : info@educafric.com',
      phone: 'Téléphone : +237 656 200 472',
      location: 'Localisation : Yaoundé, Cameroun'
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-2 gap-8">
          <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">{t.mission}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t.missionText}</p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">{t.vision}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{t.visionText}</p>
          </div>
        </div>
      </section>

      {/* Company Info */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">{t.company}</h2>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
            {t.companyText}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">{t.values}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.valuesList.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-card p-6 rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow">
                  <IconComponent className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">{t.stats}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {t.statsList.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">{t.contact}</h2>
          <p className="text-lg text-muted-foreground mb-8">{t.contactText}</p>
          <div className="space-y-3 text-lg">
            <p>{t.email}</p>
            <p>{t.phone}</p>
            <p>{t.location}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
