/**
 * @jest-environment node
 */
import { generateHeuristicResponse, getTopCategory } from '@/app/api/assistant/route';

const mockMetrics = {
  breakdown: { transport: 180, electricity: 120, food: 54, waste: 25, shopping: 140 },
  total: 519
};

describe('getTopCategory', () => {
  test('returns category with highest value', () => {
    const top = getTopCategory(mockMetrics);
    expect(top.name).toBe('Shopping');
    expect(top.value).toBe(140);
  });

  test('returns category with value zero for empty metrics', () => {
    const top = getTopCategory({ breakdown: {} });
    expect(top.value).toBe(0);
  });

  test('handles null metrics', () => {
    const top = getTopCategory(null);
    expect(top.value).toBe(0);
  });
});

describe('generateHeuristicResponse', () => {
  test('handles transport query', () => {
    const response = generateHeuristicResponse('How can I reduce my driving emissions?', mockMetrics, 'TestUser', 400);
    expect(response).toContain('Travel & Transport');
    expect(response).toContain('180 kg CO₂/month');
  });

  test('handles food query', () => {
    const response = generateHeuristicResponse('Tell me about sustainable eating', mockMetrics, 'TestUser', 400);
    expect(response).toContain('Food & Diet');
  });

  test('handles energy query', () => {
    const response = generateHeuristicResponse('How do I save electricity at home?', mockMetrics, 'TestUser', 400);
    expect(response).toContain('Home Energy');
  });

  test('handles shopping query', () => {
    const response = generateHeuristicResponse('Tips for sustainable shopping', mockMetrics, 'TestUser', 400);
    expect(response).toContain('Shopping & Consumption');
  });

  test('handles general carbon query', () => {
    const response = generateHeuristicResponse('What is a carbon footprint?', mockMetrics, 'TestUser', 400);
    expect(response).toContain('Understanding Your Carbon Footprint');
  });

  test('handles query without metrics data', () => {
    const response = generateHeuristicResponse('What can I do to help?', null, 'NewUser', 400);
    expect(response).toContain('Daily Action');
  });

  test('always includes Daily Action section', () => {
    const queries = [
      'How do I reduce waste?',
      'Tell me about transport',
      'What should I eat?',
      'Help me save energy',
      'Shopping tips'
    ];
    queries.forEach(q => {
      const response = generateHeuristicResponse(q, mockMetrics, 'TestUser', 400);
      expect(response).toContain('Daily Action');
    });
  });

  test('includes relatable CO₂ comparisons', () => {
    const response = generateHeuristicResponse('How can I drive less?', mockMetrics, 'TestUser', 400);
    expect(response).toContain('kg CO₂');
  });

  test('mentions overshoot when over budget', () => {
    const highMetrics = {
      breakdown: { transport: 300, electricity: 200, food: 100, waste: 50, shopping: 200 },
      total: 850
    };
    const response = generateHeuristicResponse('What is my footprint?', highMetrics, 'TestUser', 400);
    expect(response).toContain('over budget');
  });
});
