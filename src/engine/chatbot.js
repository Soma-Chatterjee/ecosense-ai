// EcoSense AI Chatbot Engine — Intent-based NLP with RAG retrieval
import knowledgeBase from './knowledgeBase';

class EcoSenseChatbot {
  constructor() {
    this.kb = knowledgeBase;
    this.conversationHistory = [];
    this.context = { userName: null, dietType: null, transportMode: null, hasDiscussed: new Set() };

    this.intents = [
      { name: 'greeting', patterns: [/^(hi|hello|hey|namaste|good morning|good evening|hola|greetings)/i], handler: () => this.handleGreeting() },
      { name: 'carbon_footprint_query', patterns: [/carbon\s*footprint/i, /how\s*much\s*(co2|carbon|emission)/i, /my\s*(footprint|emission|impact)/i], handler: (msg) => this.handleFootprintQuery(msg) },
      { name: 'diet_query', patterns: [/diet|food|eat|meat|vegan|vegetarian|cook|meal|nutrition/i], handler: (msg) => this.handleDietQuery(msg) },
      { name: 'transport_query', patterns: [/transport|travel|drive|car|bus|train|cycle|commute|flight|fly|bike|walk/i], handler: (msg) => this.handleTransportQuery(msg) },
      { name: 'energy_query', patterns: [/energy|electricity|power|light|ac|air\s*condition|solar|fan|bulb|appliance/i], handler: (msg) => this.handleEnergyQuery(msg) },
      { name: 'shopping_query', patterns: [/shop|buy|fashion|clothes|product|phone|gadget|online|amazon|purchase/i], handler: (msg) => this.handleShoppingQuery(msg) },
      { name: 'waste_query', patterns: [/waste|recycle|garbage|trash|plastic|compost|dispose|landfill|segregat/i], handler: (msg) => this.handleWasteQuery(msg) },
      { name: 'water_query', patterns: [/water|shower|tap|rain|leak|bath|conserv/i], handler: (msg) => this.handleWaterQuery(msg) },
      { name: 'sdg_query', patterns: [/sdg|sustainable\s*development|goal\s*12|united\s*nations/i], handler: () => this.handleSDGQuery() },
      { name: 'tips_request', patterns: [/tip|suggest|recommend|advice|help|what\s*(can|should)\s*i\s*do/i], handler: (msg) => this.handleTipsRequest(msg) },
      { name: 'compare', patterns: [/compare|vs|versus|difference|better|worse/i], handler: (msg) => this.handleCompare(msg) },
      { name: 'impact', patterns: [/impact|effect|consequence|climate|global\s*warming|environment/i], handler: (msg) => this.handleImpactQuery(msg) },
      { name: 'thanks', patterns: [/thank|thanks|thx|appreciate/i], handler: () => this.handleThanks() },
      { name: 'farewell', patterns: [/bye|goodbye|see\s*you|quit|exit/i], handler: () => this.handleFarewell() },
      { name: 'about', patterns: [/who\s*are\s*you|what\s*are\s*you|about\s*you|your\s*name/i], handler: () => this.handleAbout() }
    ];
  }

  async processMessage(message) {
    const trimmedMsg = message.trim();
    this.conversationHistory.push({ role: 'user', content: trimmedMsg, timestamp: Date.now() });
    this.extractEntities(trimmedMsg);

    for (const intent of this.intents) {
      for (const pattern of intent.patterns) {
        if (pattern.test(trimmedMsg)) {
          const response = await intent.handler(trimmedMsg);
          this.conversationHistory.push({ role: 'bot', content: response.text, timestamp: Date.now() });
          return response;
        }
      }
    }

    const kbResults = this.kb.search(trimmedMsg, 2);
    if (kbResults.length > 0) {
      const response = { text: `Here's what I found about "${trimmedMsg}":`, tips: kbResults, quickReplies: ['Tell me more', 'Different topic', 'Calculate my footprint'] };
      this.conversationHistory.push({ role: 'bot', content: response.text, timestamp: Date.now() });
      return response;
    }

    return this.handleFallback(trimmedMsg);
  }

  extractEntities(message) {
    const lower = message.toLowerCase();
    if (/vegan/i.test(lower)) this.context.dietType = 'vegan';
    else if (/vegetarian/i.test(lower)) this.context.dietType = 'vegetarian';
    else if (/meat/i.test(lower)) this.context.dietType = 'meat_eater';
    if (/car|drive/i.test(lower)) this.context.transportMode = 'car';
    else if (/bus/i.test(lower)) this.context.transportMode = 'bus';
    else if (/train|metro/i.test(lower)) this.context.transportMode = 'train';
    const nameMatch = lower.match(/(?:my name is|i'm|i am)\s+(\w+)/i);
    if (nameMatch) this.context.userName = nameMatch[1];
  }

  handleGreeting() {
    const greetings = [
      `Hello! I'm **EcoSense AI**, your personal sustainability advisor.\n\nI can help you with:\n• Understanding your carbon footprint\n• Getting eco-friendly tips for daily life\n• Comparing environmental impact of choices\n• Learning about SDG 12 and responsible consumption\n\nWhat would you like to know?`,
      `Hey there! Welcome to **EcoSense AI**!\n\nI'm here to help you make more sustainable choices. Ask me anything about reducing your environmental impact — from food and travel to energy and shopping.\n\nWhat's on your mind?`
    ];
    return { text: greetings[Math.floor(Math.random() * greetings.length)], quickReplies: ["What's my carbon footprint?", 'Give me eco tips', 'How does diet affect emissions?', 'Tell me about SDG 12'] };
  }

  handleFootprintQuery(msg) {
    if (/meat/i.test(msg.toLowerCase())) {
      return { text: `Great question! Here's how meat consumption affects your carbon footprint:\n\n• **Heavy meat eater**: ~7.19 kg CO₂/day\n• **Vegetarian**: ~3.81 kg CO₂/day\n• **Vegan**: ~2.89 kg CO₂/day\n\nA heavy meat diet produces **2.5x more emissions** than vegan!\n\nOver a year, switching could save ~**1,234 kg CO₂** — equivalent to planting 56 trees!`, tips: this.kb.search('meat diet vegetarian', 2), quickReplies: ['How to reduce food emissions?', 'What about my travel?', 'Give me easy tips'] };
    }
    return { text: `Your carbon footprint is the total greenhouse gases from daily activities.\n\nThe average Indian produces about **1.9 tonnes CO₂/year**, while the global average is **4.7 tonnes**.\n\nYour footprint comes from:\n• **Food & Diet** — What you eat\n• **Transport** — How you commute\n• **Energy** — Home electricity\n• **Shopping** — What you buy\n• **Waste** — How you dispose\n\nUse the **Carbon Calculator** to get your personalized estimate!`, quickReplies: ['How does diet affect it?', 'Tips to reduce transport', 'How can I save energy?'] };
  }

  handleDietQuery(msg) {
    this.context.hasDiscussed.add('food');
    const tips = this.kb.search(msg, 2);
    const lower = msg.toLowerCase();
    let info = '';
    if (/vegan/i.test(lower)) info = `**Vegan diets** have the lowest footprint at ~**2.89 kg CO₂/day**. That saves ~1,570 kg CO₂/year vs heavy meat.\n\n`;
    else if (/vegetarian/i.test(lower)) info = `**Vegetarian diets** produce ~**3.81 kg CO₂/day** — 47% less than heavy meat!\n\n`;
    else if (/meat/i.test(lower)) info = `**Meat-heavy diets** produce up to **7.19 kg CO₂/day**. Beef is the biggest culprit — 1 kg beef generates ~27 kg CO₂e.\n\n`;
    else info = `**Food accounts for 22% of global emissions.** Quick comparison:\n\n| Diet Type | Daily CO₂ | Annual CO₂ |\n|---|---|---|\n| Heavy Meat | 7.19 kg | 2,624 kg |\n| Vegetarian | 3.81 kg | 1,391 kg |\n| Vegan | 2.89 kg | 1,055 kg |\n\n`;
    return { text: info + 'Here are some actionable tips:', tips, quickReplies: ['How to reduce food waste?', 'What about transport?', 'Tell me about composting'] };
  }

  handleTransportQuery(msg) {
    this.context.hasDiscussed.add('transport');
    const tips = this.kb.search(msg, 2);
    const lower = msg.toLowerCase();
    let response = '';
    if (/car|drive/i.test(lower)) response = `**Cars** are one of the biggest personal emission sources:\n\n• Petrol car: **0.192 kg CO₂/km**\n• Electric car: **0.053 kg CO₂/km** (72% less!)\n\nA 20 km daily commute by petrol car = **3.84 kg CO₂/day** = **1,402 kg/year**!\n\nSwitching to public transport could save **900+ kg CO₂/year**.`;
    else if (/bus|train|metro|public/i.test(lower)) response = `**Public transport** is one of the greenest commute options:\n\n• Bus: **0.089 kg CO₂/km** (50-75% less than car)\n• Train/Metro: **0.041 kg CO₂/km** (80% less)\n\nTaking the metro for 20 km daily = just **0.82 kg CO₂/day** vs 3.84 kg by car!`;
    else if (/flight|fly/i.test(lower)) response = `**Air travel** has the highest per-km emissions:\n\n• Domestic flight: **0.255 kg CO₂/km** per passenger\n• Delhi-Mumbai (~1,400 km) ≈ **357 kg CO₂**\n\nFor distances under 500 km, **trains emit 6x less** than flights.`;
    else response = `**Transport emissions** comparison (per km):\n\n| Mode | CO₂/km | Rating |\n|---|---|---|\n| Domestic Flight | 0.255 kg | Highest |\n| Petrol Car | 0.192 kg | High |\n| Auto Rickshaw | 0.098 kg | Medium |\n| Bus | 0.089 kg | Low |\n| Train/Metro | 0.041 kg | Very Low |\n| Bicycle | 0.000 kg | Zero |`;
    return { text: response, tips, quickReplies: ['Compare car vs bus', 'Tips for greener travel', 'Electric vehicles?'] };
  }

  handleEnergyQuery(msg) {
    this.context.hasDiscussed.add('energy');
    return { text: `**Home energy** is a major emission source:\n\n**Electricity** (Indian grid): **0.82 kg CO₂ per kWh**\n\nCommon appliances:\n• AC (1.5 ton): ~1.23 kg CO₂/hour\n• Ceiling Fan: ~0.06 kg CO₂/hour\n• LED bulb: ~0.008 kg CO₂/hour\n\nQuick wins:\n• **Switch to LED** — saves 75% energy\n• **Set AC to 24°C** — each degree below adds 6-8% more energy\n• **Use fans first** — 20x less energy than AC\n• **Unplug standby devices** — saves 5-10% of total bill`, tips: this.kb.search(msg, 2), quickReplies: ['How to reduce AC usage?', 'Solar panel benefits?', 'More energy tips'] };
  }

  handleShoppingQuery(msg) {
    this.context.hasDiscussed.add('shopping');
    const lower = msg.toLowerCase();
    let response = '';
    if (/fashion|clothes/i.test(lower)) response = `**Fast fashion** is one of the most polluting industries:\n\n• Fashion produces **10% of global carbon emissions**\n• A single fast-fashion garment ≈ **10 kg CO₂**\n• People buy 60% more clothing now vs 15 years ago\n\nSustainable choices:\n• Buy second-hand — saves 5-10 kg CO₂ per item\n• Choose quality over quantity\n• Repair instead of replacing`;
    else response = `**Our consumption habits** have massive impact:\n\n• Only **9% of all plastic** has ever been recycled\n• E-commerce returns generate **5 billion lbs** of landfill waste/year\n• Express delivery has **3-4x the emissions** of standard shipping\n\nSimple rules:\n1. **Need vs Want** — Wait 48 hours before non-essential purchases\n2. **Local & Second-hand first**\n3. **Repair & Reuse**\n4. **Batch orders** — avoid single-item express deliveries`;
    return { text: response, tips: this.kb.search(msg, 2), quickReplies: ['Sustainable fashion tips', 'Reduce packaging waste?', 'More shopping tips'] };
  }

  handleWasteQuery(msg) {
    this.context.hasDiscussed.add('waste');
    return { text: `**Waste management** is crucial for sustainability:\n\nIndia generates **62 million tonnes** of waste annually — only 20% is properly processed.\n\n**How to start:**\n1. **Segregate at source** — Wet, Dry, Hazardous\n2. **Reduce** — Say no to single-use plastics\n3. **Reuse** — Cloth bags, steel bottles, containers\n4. **Recycle** — Learn your local recycling rules\n5. **Rot** — Compost kitchen waste\n\nProper waste segregation can divert **60-80% of waste** from landfills!`, tips: this.kb.search(msg, 2), quickReplies: ['How to start composting?', 'E-waste disposal', 'Reduce plastic use'] };
  }

  handleWaterQuery(msg) {
    this.context.hasDiscussed.add('water');
    return { text: `**Water conservation** is linked to carbon emissions — treating and pumping water requires energy.\n\nQuick facts:\n• A dripping tap wastes **20+ liters/day** (~7,300 liters/year)\n• A 10-minute shower uses **100+ liters**\n• Bucket bathing uses only **30-40 liters**\n\nEasy wins:\n• Fix leaky taps immediately\n• Take shorter showers (aim for 5 minutes)\n• Use a bucket — saves 60% water\n• Consider rainwater harvesting\n• Install low-flow fixtures — reduce flow by 40%`, tips: this.kb.search(msg, 2), quickReplies: ['Rainwater harvesting', 'Water-saving fixtures', 'What about energy?'] };
  }

  handleSDGQuery() {
    return { text: `**SDG 12 — Responsible Consumption and Production**\n\nOne of the 17 UN Sustainable Development Goals. Aim: *"Ensure sustainable consumption and production patterns."*\n\n**Key Targets:**\n• **Target 12.3**: Halve per capita food waste by 2030\n• **Target 12.5**: Substantially reduce waste through prevention, reduction, recycling, and reuse\n• **Target 12.8**: Ensure people everywhere have awareness for sustainable lifestyles\n\n**Why it matters:**\n• If population reaches 9.8 billion by 2050, we'd need **3 Earths** to sustain current lifestyles\n• 1/3 of all food produced globally is wasted\n• Only 9% of all plastic has ever been recycled\n\nEcoSense AI directly supports **Target 12.8** by providing AI-powered awareness for sustainable lifestyles.`, quickReplies: ['What can I do about food waste?', 'How to reduce plastic?', 'Calculate my footprint'] };
  }

  handleTipsRequest(msg) {
    const tips = this.kb.search(msg, 3);
    if (tips.length === 0) {
      return { text: 'Here are some **easy-to-implement tips** with high impact:', tips: this.kb.getEasyWins(3), quickReplies: ['Tips for food', 'Tips for transport', 'Tips for energy'] };
    }
    return { text: 'Based on your question, here are relevant sustainability tips:', tips, quickReplies: ['More tips', 'Show highest impact tips', 'Easy wins for beginners'] };
  }

  handleCompare(msg) {
    const lower = msg.toLowerCase();
    if (/car.*bus|bus.*car/i.test(lower)) {
      return { text: `**Car vs Bus** — Environmental Comparison:\n\n| Factor | Petrol Car | City Bus |\n|---|---|---|\n| CO₂/km | 0.192 kg | 0.089 kg |\n| 20 km daily | 3.84 kg/day | 1.78 kg/day |\n| Annual (250 days) | 960 kg | 445 kg |\n| Savings | — | **515 kg CO₂/year** |\n\nSwitching from car to bus saves **515 kg CO₂/year** — equivalent to planting **23 trees**!`, quickReplies: ['Train vs car?', 'Electric car benefits?', 'Cycling benefits'] };
    }
    if (/meat.*vegan|vegan.*meat|vegetarian.*meat/i.test(lower)) {
      return { text: `**Meat vs Plant-Based** — Carbon Comparison:\n\n| Diet | Daily CO₂ | Annual CO₂ | Trees to Offset |\n|---|---|---|---|\n| Heavy Meat | 7.19 kg | 2,624 kg | 119 trees |\n| Vegetarian | 3.81 kg | 1,391 kg | 63 trees |\n| Vegan | 2.89 kg | 1,055 kg | 48 trees |\n\nGoing from heavy meat to vegan saves **1,569 kg CO₂/year**!`, quickReplies: ['How to go plant-based?', 'Meatless Monday tips', 'More comparisons'] };
    }
    return { text: `I can compare the environmental impact of different choices! Try:\n\n• "Compare car vs bus"\n• "Compare meat vs vegan diet"\n• "Compare LED vs incandescent"\n\nWhat would you like to compare?`, quickReplies: ['Compare car vs bus', 'Compare meat vs vegan', 'Compare AC vs fan'] };
  }

  handleImpactQuery() {
    return { text: `**Climate change** is driven by greenhouse gas emissions:\n\n**Global Impact:**\n• Average temperature has risen **1.1°C** since pre-industrial times\n• Sea levels rising ~**3.6 mm/year**\n• Extreme weather events increased **5x** since 1970\n\n**India-Specific:**\n• India is the **3rd largest emitter** globally\n• Per capita emissions (1.9 tonnes) are **below** global average (4.7 tonnes)\n\n**The Good News:**\nIf every Indian reduced their footprint by just **10%**, it would save **280 million tonnes of CO₂/year**!\n\nEvery small choice adds up.`, quickReplies: ['How can I help?', 'Calculate my footprint', 'Easy tips to start'] };
  }

  handleThanks() {
    const responses = [`You're welcome! Remember, every sustainable choice counts. Feel free to ask anything else!`, `Happy to help! Keep making those green choices — you're making a real difference!`];
    return { text: responses[Math.floor(Math.random() * responses.length)], quickReplies: ['Give me another tip', 'Calculate my footprint'] };
  }

  handleFarewell() {
    return { text: `Goodbye! Remember:\n\n> *"The greatest threat to our planet is the belief that someone else will save it."* — Robert Swan\n\nEvery small action matters. Keep making sustainable choices!`, quickReplies: [] };
  }

  handleAbout() {
    return { text: `I'm **EcoSense AI**, a conversational AI assistant built for the **1M1B AI for Sustainability Internship** (IBM SkillsBuild & AICTE).\n\n**What I can do:**\n• Estimate your carbon footprint\n• Give personalized sustainability tips\n• Explain how daily choices impact the environment\n• Search through 50+ eco-tips using AI-powered retrieval\n• Compare environmental impact of different options\n\n**How I work:**\nI use prompt engineering, entity extraction, and a RAG-style knowledge retrieval system to understand your questions.\n\n**SDG Focus:** SDG 12 — Responsible Consumption and Production\n\nAll data stays in your browser. No personal information is collected.`, quickReplies: ["What's my footprint?", 'Give me eco tips', 'Tell me about SDG 12'] };
  }

  handleFallback() {
    return { text: `I'm focused on sustainability and carbon footprint topics. Here's what you can ask:\n\n• "What's my carbon footprint?"\n• "Give me tips to save energy"\n• "How does meat affect the environment?"\n• "Compare cycling vs driving"\n\nWhat would you like to know?`, quickReplies: ['Calculate my footprint', 'Eco tips for beginners', 'Tell me about SDG 12'] };
  }
}

const chatbot = new EcoSenseChatbot();
export default chatbot;
