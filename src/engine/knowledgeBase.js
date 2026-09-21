// Knowledge Base Engine — RAG-style retrieval for sustainability tips
import ecoTipsData from '../data/eco-tips.json';

class KnowledgeBase {
  constructor() {
    this.tips = [];
    this.categories = {};
    this.index = {};
    this.loaded = false;
  }

  load() {
    this.tips = ecoTipsData.tips;
    this.categories = ecoTipsData.categories;
    this.buildIndex();
    this.loaded = true;
  }

  buildIndex() {
    this.index = {};
    this.tips.forEach(tip => {
      const allWords = [
        ...tip.keywords,
        ...this.tokenize(tip.title),
        ...this.tokenize(tip.description),
        tip.category
      ];
      allWords.forEach(word => {
        const normalized = word.toLowerCase().trim();
        if (normalized.length < 2) return;
        if (!this.index[normalized]) this.index[normalized] = new Set();
        this.index[normalized].add(tip.id);
      });
    });
  }

  tokenize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  }

  search(query, topK = 3) {
    if (!this.loaded) return [];
    const queryTokens = this.tokenize(query);
    const scores = {};

    queryTokens.forEach(token => {
      if (this.index[token]) {
        this.index[token].forEach(tipId => { scores[tipId] = (scores[tipId] || 0) + 3; });
      }
      Object.keys(this.index).forEach(indexWord => {
        if (indexWord.includes(token) || token.includes(indexWord)) {
          this.index[indexWord].forEach(tipId => { scores[tipId] = (scores[tipId] || 0) + 1; });
        }
      });
    });

    const categoryKeywords = {
      food: ['food', 'eat', 'diet', 'meal', 'cook', 'kitchen', 'meat', 'vegan', 'vegetarian'],
      transport: ['travel', 'drive', 'car', 'bus', 'train', 'cycle', 'commute', 'flight', 'transport'],
      energy: ['energy', 'electricity', 'power', 'light', 'ac', 'appliance', 'solar', 'fan', 'bulb'],
      shopping: ['shop', 'buy', 'purchase', 'clothes', 'fashion', 'product', 'phone', 'gadget'],
      waste: ['waste', 'recycle', 'garbage', 'trash', 'plastic', 'compost', 'dispose', 'landfill'],
      water: ['water', 'shower', 'tap', 'rain', 'leak', 'bath']
    };

    queryTokens.forEach(token => {
      Object.entries(categoryKeywords).forEach(([category, keywords]) => {
        if (keywords.some(kw => kw.includes(token) || token.includes(kw))) {
          this.tips.filter(t => t.category === category).forEach(t => {
            scores[t.id] = (scores[t.id] || 0) + 1;
          });
        }
      });
    });

    const rankedTipIds = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK)
      .map(([id]) => parseInt(id));

    return rankedTipIds.map(id => this.tips.find(t => t.id === id)).filter(Boolean);
  }

  getByCategory(category) {
    if (category === 'all') return [...this.tips];
    return this.tips.filter(t => t.category === category);
  }

  getEasyWins(count = 5) {
    return this.tips
      .filter(t => t.difficulty === 'easy')
      .sort((a, b) => b.co2_saving_kg_year - a.co2_saving_kg_year)
      .slice(0, count);
  }

  getCategoryInfo(category) {
    return this.categories[category] || null;
  }
}

const knowledgeBase = new KnowledgeBase();
knowledgeBase.load();

export default knowledgeBase;
