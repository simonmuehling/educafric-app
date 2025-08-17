import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Triangle, Calculator, CheckCircle, XCircle } from 'lucide-react';

const GeometryExercise: React.FC = () => {
  const { language } = useLanguage();
  const [answers, setAnswers] = useState({
    perimeter: '',
    area: '',
    explanation: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const text = {
    fr: {
      title: 'Exercices Géométrie - Triangles',
      subtitle: 'Calculez les propriétés du triangle',
      problem: 'Problème',
      problemText: 'Un triangle ABC a les côtés suivants : AB = 6 cm, BC = 8 cm, CA = 10 cm.',
      questions: {
        perimeter: 'Calculez le périmètre du triangle',
        area: 'Calculez l\'aire du triangle (utilisez la formule de Héron)',
        explanation: 'Expliquez votre démarche pour calculer l\'aire'
      },
      answers: 'Vos réponses',
      perimeter: 'Périmètre (cm)',
      area: 'Aire (cm²)',
      explanation: 'Explication',
      submit: 'Soumettre',
      submitted: 'Soumis',
      correct: 'Correct',
      incorrect: 'Incorrect',
      score: 'Score',
      hints: {
        title: 'Indices',
        perimeter: 'Périmètre = somme des trois côtés',
        area: 'Formule de Héron : A = √[s(s-a)(s-b)(s-c)] où s = (a+b+c)/2',
        check: 'Vérifiez que c\'est un triangle rectangle (théorème de Pythagore)'
      }
    },
    en: {
      title: 'Geometry Exercises - Triangles',
      subtitle: 'Calculate triangle properties',
      problem: 'Problem',
      problemText: 'Triangle ABC has the following sides: AB = 6 cm, BC = 8 cm, CA = 10 cm.',
      questions: {
        perimeter: 'Calculate the perimeter of the triangle',
        area: 'Calculate the area of the triangle (use Heron\'s formula)',
        explanation: 'Explain your approach to calculate the area'
      },
      answers: 'Your answers',
      perimeter: 'Perimeter (cm)',
      area: 'Area (cm²)',
      explanation: 'Explanation',
      submit: 'Submit',
      submitted: 'Submitted',
      correct: 'Correct',
      incorrect: 'Incorrect',
      score: 'Score',
      hints: {
        title: 'Hints',
        perimeter: 'Perimeter = sum of all three sides',
        area: 'Heron\'s formula: A = √[s(s-a)(s-b)(s-c)] where s = (a+b+c)/2',
        check: 'Check if it\'s a right triangle (Pythagorean theorem)'
      }
    }
  };

  const t = text[language as keyof typeof text];

  const handleSubmit = () => {
    let newScore = 0;
    
    // Check perimeter (correct answer: 24)
    if (parseFloat(answers.perimeter) === 24) {
      newScore += 40;
    }
    
    // Check area (correct answer: 24, since it's a right triangle)
    if (parseFloat(answers.area) === 24) {
      newScore += 40;
    }
    
    // Check explanation (basic check for key words)
    if (answers?.explanation?.toLowerCase().includes('héron') || 
        answers?.explanation?.toLowerCase().includes('heron') ||
        answers?.explanation?.toLowerCase().includes('rectangle') ||
        answers?.explanation?.toLowerCase().includes('right')) {
      newScore += 20;
    }
    
    setScore(newScore);
    setIsSubmitted(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-2">
            <Triangle className="w-8 h-8 text-blue-600" />
            {t.title || ''}
          </h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Problem Statement */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              {t.problem}
            </h2>
          </CardHeader>
          <CardContent className="bg-white p-6">
            <p className="text-gray-700 text-lg mb-4">{t.problemText}</p>
            
            {/* Triangle Visualization */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <svg width="300" height="200" className="mx-auto">
                <polygon 
                  points="50,150 200,150 125,50" 
                  fill="rgba(59, 130, 246, 0.1)" 
                  stroke="#3B82F6" 
                  strokeWidth="2"
                />
                <text x="25" y="165" className="text-sm fill-gray-700">A</text>
                <text x="205" y="165" className="text-sm fill-gray-700">B</text>
                <text x="125" y="40" className="text-sm fill-gray-700">C</text>
                <text x="125" y="175" className="text-sm fill-gray-700">AB = 6 cm</text>
                <text x="230" y="110" className="text-sm fill-gray-700">BC = 8 cm</text>
                <text x="70" y="110" className="text-sm fill-gray-700">CA = 10 cm</text>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Questions and Answers */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">{t.answers}</h2>
          </CardHeader>
          <CardContent className="bg-white p-6">
            <div className="space-y-6">
              {/* Perimeter Question */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-gray-900">
                  1. {t?.questions?.perimeter}
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="24"
                    value={answers.perimeter}
                    onChange={(e) => setAnswers({...answers, perimeter: e?.target?.value})}
                    className="bg-white border-gray-300 focus:border-blue-500 max-w-32"
                    disabled={isSubmitted}
                  />
                  <span className="text-gray-600">cm</span>
                  {isSubmitted && (
                    parseFloat(answers.perimeter) === 24 ? 
                    <CheckCircle className="w-5 h-5 text-green-600" /> :
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>

              {/* Area Question */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-gray-900">
                  2. {t?.questions?.area}
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    placeholder="24"
                    value={answers.area}
                    onChange={(e) => setAnswers({...answers, area: e?.target?.value})}
                    className="bg-white border-gray-300 focus:border-blue-500 max-w-32"
                    disabled={isSubmitted}
                  />
                  <span className="text-gray-600">cm²</span>
                  {isSubmitted && (
                    parseFloat(answers.area) === 24 ? 
                    <CheckCircle className="w-5 h-5 text-green-600" /> :
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-3">
                <Label className="text-base font-medium text-gray-900">
                  3. {t?.questions?.explanation}
                </Label>
                <Textarea
                  placeholder={language === 'fr' ? "Décrivez votre méthode de calcul..." : "Describe your calculation method..."}
                  value={answers.explanation}
                  onChange={(e) => setAnswers({...answers, explanation: e?.target?.value})}
                  rows={4}
                  className="bg-white border-gray-300 focus:border-blue-500"
                  disabled={isSubmitted}
                />
                {isSubmitted && (
                  <div className="flex items-center gap-2">
                    {answers?.explanation?.toLowerCase().includes('héron') || 
                     answers?.explanation?.toLowerCase().includes('heron') ||
                     answers?.explanation?.toLowerCase().includes('rectangle') ||
                     answers?.explanation?.toLowerCase().includes('right') ? 
                      <CheckCircle className="w-5 h-5 text-green-600" /> :
                      <XCircle className="w-5 h-5 text-red-600" />
                    }
                    <span className="text-sm text-gray-600">
                      {language === 'fr' ? 'Explication évaluée' : 'Explanation evaluated'}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button and Score */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitted || !answers.perimeter || !answers.area || !answers.explanation}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {isSubmitted ? t.submitted : t.submit}
                </Button>
                
                {isSubmitted && (
                  <Badge className={`px-4 py-2 text-base ${getScoreColor(score)}`}>
                    {t.score}: {score}/100
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hints */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="bg-white border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">{t?.hints?.title}</h2>
          </CardHeader>
          <CardContent className="bg-white p-6">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800"><strong>💡 {t.perimeter}:</strong> {t?.hints?.perimeter}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800"><strong>📐 {t.area}:</strong> {t?.hints?.area}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-purple-800"><strong>🔍 Vérification:</strong> {t?.hints?.check}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeometryExercise;