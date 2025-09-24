import { FeatureRequest } from '@/types/FeatureRequest';

const GEMINI_API_KEY = 'AIzaSyAIXEsy0O_sIbiRtabItJh5DIL137WW0N0';

export interface AIAnalysisResult {
  category: 'enhancement' | 'bug-fix' | 'new-feature' | 'ui-ux' | 'performance' | 'integration';
  complexity: number;
  clarityScore: number;
  sentiment: 'frustrated' | 'neutral' | 'excited';
  keywords: string[];
  confidence: number;
  enhancementSuggestions: string[];
}

export interface PriorityScore {
  overall: number;
  businessImpact: number;
  userDemand: number;
  strategicAlignment: number;
  implementationFeasibility: number;
}

export interface EffortEstimate {
  totalHours: number;
  frontendHours: number;
  backendHours: number;
  designHours: number;
  qaHours: number;
  riskFactors: string[];
  dependencies: string[];
  teamMembers: string[];
}

export interface BusinessImpact {
  retentionImpact: number;
  revenueImpact: number;
  competitiveAdvantage: number;
  uxImprovement: number;
  operationalEfficiency: number;
}

export const analyzeFeatureRequest = async (
  title: string,
  description: string,
  appContext?: string
): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
Analyze this feature request and provide a JSON response with the following structure:

{
  "category": "enhancement|bug-fix|new-feature|ui-ux|performance|integration",
  "complexity": 1-5,
  "clarityScore": 1-10,
  "sentiment": "frustrated|neutral|excited",
  "keywords": ["keyword1", "keyword2"],
  "confidence": 0.0-1.0,
  "enhancementSuggestions": ["suggestion1", "suggestion2"]
}

Feature Request:
Title: ${title}
Description: ${description}
App Context: ${appContext || 'General application'}

Analysis Guidelines:
- Category: Classify the type of request
- Complexity: Technical implementation difficulty (1=very simple, 5=very complex)
- Clarity Score: How well-defined the request is (1=very vague, 10=crystal clear)
- Sentiment: User's emotional tone
- Keywords: Key technical terms and concepts
- Confidence: How confident you are in this analysis
- Enhancement Suggestions: Ways to improve or clarify the request

Respond with valid JSON only.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response from AI');
    }

    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const analysis = JSON.parse(cleanedText);

    return {
      category: analysis.category || 'enhancement',
      complexity: Math.min(Math.max(analysis.complexity || 3, 1), 5),
      clarityScore: Math.min(Math.max(analysis.clarityScore || 5, 1), 10),
      sentiment: analysis.sentiment || 'neutral',
      keywords: analysis.keywords || [],
      confidence: Math.min(Math.max(analysis.confidence || 0.7, 0), 1),
      enhancementSuggestions: analysis.enhancementSuggestions || []
    };
  } catch (error) {
    console.error('AI Analysis error:', error);
    
    // Fallback analysis
    return {
      category: 'enhancement',
      complexity: 3,
      clarityScore: 5,
      sentiment: 'neutral',
      keywords: extractKeywords(title + ' ' + description),
      confidence: 0.3,
      enhancementSuggestions: [
        'Consider providing more specific details about the expected behavior',
        'Include use cases or examples to clarify the request'
      ]
    };
  }
};

export const calculatePriorityScore = async (
  request: FeatureRequest,
  analysis: AIAnalysisResult,
  userDemandFactor: number = 1
): Promise<PriorityScore> => {
  try {
    const prompt = `
Calculate priority scores for this feature request. Return JSON with this structure:

{
  "businessImpact": 1-10,
  "userDemand": 1-10,
  "strategicAlignment": 1-10,
  "implementationFeasibility": 1-10,
  "overall": 1-10
}

Feature Request Analysis:
- Title: ${request.title}
- Description: ${request.description}
- Category: ${analysis.category}
- Complexity: ${analysis.complexity}/5
- User Priority: ${request.userPriority}
- User Role: ${request.submitterRole}
- Sentiment: ${analysis.sentiment}
- Clarity: ${analysis.clarityScore}/10

Scoring Guidelines:
- Business Impact: Revenue, retention, competitive advantage potential
- User Demand: How many users would benefit (factor in user role importance)
- Strategic Alignment: Fits with product roadmap and company goals
- Implementation Feasibility: Considering complexity and resources
- Overall: Weighted combination of above factors

Respond with valid JSON only.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Priority calculation failed: ${response.status}`);
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const scores = JSON.parse(cleanedText);

    // Apply user demand factor
    const adjustedUserDemand = Math.min(scores.userDemand * userDemandFactor, 10);

    // Calculate weighted overall score
    const overall = (
      scores.businessImpact * 0.4 +
      adjustedUserDemand * 0.25 +
      scores.strategicAlignment * 0.2 +
      scores.implementationFeasibility * 0.15
    );

    return {
      businessImpact: Math.min(Math.max(scores.businessImpact || 5, 1), 10),
      userDemand: Math.min(Math.max(adjustedUserDemand, 1), 10),
      strategicAlignment: Math.min(Math.max(scores.strategicAlignment || 5, 1), 10),
      implementationFeasibility: Math.min(Math.max(scores.implementationFeasibility || 5, 1), 10),
      overall: Math.min(Math.max(overall, 1), 10)
    };
  } catch (error) {
    console.error('Priority calculation error:', error);
    
    // Fallback calculation
    const userPriorityMap = { low: 3, medium: 5, high: 7, critical: 9 };
    const baseScore = userPriorityMap[request.userPriority] || 5;
    
    return {
      businessImpact: baseScore,
      userDemand: baseScore * userDemandFactor,
      strategicAlignment: baseScore,
      implementationFeasibility: Math.max(10 - analysis.complexity, 1),
      overall: baseScore
    };
  }
};

export const estimateEffort = async (
  request: FeatureRequest,
  analysis: AIAnalysisResult
): Promise<EffortEstimate> => {
  try {
    const prompt = `
Estimate development effort for this feature request. Return JSON with this structure:

{
  "totalHours": number,
  "frontendHours": number,
  "backendHours": number,
  "designHours": number,
  "qaHours": number,
  "riskFactors": ["risk1", "risk2"],
  "dependencies": ["dependency1", "dependency2"],
  "teamMembers": ["Frontend Developer", "Backend Developer"]
}

Feature Analysis:
- Title: ${request.title}
- Description: ${request.description}
- Category: ${analysis.category}
- Complexity: ${analysis.complexity}/5

Estimation Guidelines:
- Consider all phases: design, development, testing, deployment
- Factor in complexity and category type
- Identify potential risks and blockers
- List required team members and skills
- Include time for code review and documentation

Respond with valid JSON only.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Effort estimation failed: ${response.status}`);
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const estimate = JSON.parse(cleanedText);

    return {
      totalHours: estimate.totalHours || (analysis.complexity * 8),
      frontendHours: estimate.frontendHours || 0,
      backendHours: estimate.backendHours || 0,
      designHours: estimate.designHours || 0,
      qaHours: estimate.qaHours || 0,
      riskFactors: estimate.riskFactors || [],
      dependencies: estimate.dependencies || [],
      teamMembers: estimate.teamMembers || ['Developer']
    };
  } catch (error) {
    console.error('Effort estimation error:', error);
    
    // Fallback estimation based on complexity
    const baseHours = analysis.complexity * 8;
    return {
      totalHours: baseHours,
      frontendHours: Math.floor(baseHours * 0.4),
      backendHours: Math.floor(baseHours * 0.4),
      designHours: Math.floor(baseHours * 0.1),
      qaHours: Math.floor(baseHours * 0.1),
      riskFactors: ['Complexity may be higher than estimated'],
      dependencies: ['Requirements clarification needed'],
      teamMembers: ['Frontend Developer', 'Backend Developer']
    };
  }
};

export const assessBusinessImpact = async (
  request: FeatureRequest,
  analysis: AIAnalysisResult
): Promise<BusinessImpact> => {
  try {
    const prompt = `
Assess business impact for this feature request. Return JSON with this structure:

{
  "retentionImpact": 1-10,
  "revenueImpact": 1-10,
  "competitiveAdvantage": 1-10,
  "uxImprovement": 1-10,
  "operationalEfficiency": 1-10
}

Feature Details:
- Title: ${request.title}
- Description: ${request.description}
- Category: ${analysis.category}
- User Role: ${request.submitterRole}
- Sentiment: ${analysis.sentiment}

Assessment Guidelines:
- Retention Impact: How likely this keeps users engaged
- Revenue Impact: Potential to drive revenue growth
- Competitive Advantage: Market differentiation value
- UX Improvement: User experience enhancement
- Operational Efficiency: Internal process improvements

Respond with valid JSON only.
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Business impact assessment failed: ${response.status}`);
    }

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const impact = JSON.parse(cleanedText);

    return {
      retentionImpact: Math.min(Math.max(impact.retentionImpact || 5, 1), 10),
      revenueImpact: Math.min(Math.max(impact.revenueImpact || 5, 1), 10),
      competitiveAdvantage: Math.min(Math.max(impact.competitiveAdvantage || 5, 1), 10),
      uxImprovement: Math.min(Math.max(impact.uxImprovement || 5, 1), 10),
      operationalEfficiency: Math.min(Math.max(impact.operationalEfficiency || 5, 1), 10)
    };
  } catch (error) {
    console.error('Business impact assessment error:', error);
    
    // Fallback assessment
    return {
      retentionImpact: 5,
      revenueImpact: 5,
      competitiveAdvantage: 5,
      uxImprovement: 5,
      operationalEfficiency: 5
    };
  }
};

export const detectDuplicates = async (
  newRequest: { title: string; description: string },
  existingRequests: FeatureRequest[]
): Promise<string[]> => {
  // Simple keyword-based duplicate detection
  // In a real implementation, you'd use more sophisticated similarity algorithms
  const newKeywords = extractKeywords(newRequest.title + ' ' + newRequest.description);
  const duplicates: string[] = [];

  for (const existing of existingRequests) {
    const existingKeywords = existing.aiAnalysis?.keywords || 
      extractKeywords(existing.title + ' ' + existing.description);
    
    const commonKeywords = newKeywords.filter(k => existingKeywords.includes(k));
    const similarity = commonKeywords.length / Math.max(newKeywords.length, existingKeywords.length);
    
    if (similarity > 0.6) {
      duplicates.push(existing.id);
    }
  }

  return duplicates;
};

const extractKeywords = (text: string): string[] => {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'];
  
  return [...new Set(words.filter(word => !stopWords.includes(word)))];
};