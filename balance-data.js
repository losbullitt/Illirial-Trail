window.ILLIRIAL_BALANCE = {
  "version": "7.0.9",
  "remoteSettlementTowns": ["brookside", "glennhardt"],
  "travelBiomes": {
    "forest": {
      "label": "Forest",
      "hint": "Timber closes in — game trails and ambush lanes.",
      "marchSpeed": 0.92},
    "desert": {
      "label": "Desert",
      "hint": "Dry wind and open grit — water and shade are precious.",
      "marchSpeed": 0.85},
    "plains": {
      "label": "Plains",
      "hint": "Rolling grass and trade wind — long sight lines.",
      "marchSpeed": 1.1},
    "mountains": {
      "label": "Mountains",
      "hint": "Stone passes and thin air — the road climbs hard.",
      "marchSpeed": 0.75},
    "steppe": {
      "label": "Steppe",
      "hint": "Wide grass sea — herds, riders, and distant smoke.",
      "marchSpeed": 1.12},
    "tundra": {
      "label": "Tundra",
      "hint": "Frozen heath and brittle scrub — nights bite deep.",
      "marchSpeed": 0.8},
    "snowfields": {
      "label": "Snowfields",
      "hint": "White silence — drifts swallow the wheel ruts.",
      "marchSpeed": 0.7}
  },
  "trailLegBiomes": {
    "cantebury>gustaf": ["plains", "plains", "forest"],
    "cantebury>brookside": ["plains", "forest"],
    "gustaf>hollow_banks": ["plains", "forest", "steppe"],
    "brookside>hollow_banks": ["plains", "forest", "steppe"],
    "hollow_banks>glennhardt": ["forest", "mountains", "steppe"],
    "hollow_banks>solem": ["forest", "mountains", "steppe"],
    "glennhardt>solem": ["mountains", "steppe"],
    "solem>new_isil": ["mountains", "tundra", "snowfields"],
    "new_isil>solem": ["snowfields", "tundra", "mountains"],
    "solem>hollow_banks": ["steppe", "mountains", "forest"],
    "solem>glennhardt": ["steppe", "mountains"],
    "hollow_banks>brookside": ["steppe", "forest", "plains"],
    "hollow_banks>gustaf": ["steppe", "forest", "plains"],
    "brookside>cantebury": ["forest", "plains"],
    "gustaf>cantebury": ["forest", "plains", "plains"]
  },
  "newIsilColony": {
    "basePopulation": 12,
    "maxBuildingLevel": 3,
    "settlerArrivalPoints": 12,
    "civilianDeliveryPoints": 18,
    "settlementSites": {
      "inland": {
        "label": "Inland valley",
        "choiceTitle": "Found an inland city",
        "choiceLead": "The valley beneath the pass is open and wide — room enough for streets, fields, and walls shadowed by the mountains you crossed.",
        "choiceButton": "Commit to the valley",
        "tierLabels": {
          "camp": "Valley camp",
          "hamlet": "Highland hamlet",
          "town": "Mountain town",
          "city": "Inland city"
        },
        "buildingLabels": {
          "gateway": "Trade gate",
          "chapel": "Chapel",
          "market": "Market square",
          "walls": "Palisade & wards",
          "fields": "Terraced plots"
        },
        "buildingBlurbs": {
          "gateway": "Caravans and grain wagons — the road's terminus.",
          "fields": "Terraced gardens fed by mountain runoff."
        },
        "buildingRallyPitch": {
          "gateway": "Extend the trade gate — wagons need a proper terminus before the snows.",
          "chapel": "Raise a stone chapel so ward-lamps burn through the long nights.",
          "market": "Lay out stalls and ledgers — merchants follow coin and shelter.",
          "walls": "Raise palisades and watch posts before the pass sends trouble down.",
          "fields": "Terrace the lower slopes while the soil is still soft."
        },
      },
      "coastal": {
        "label": "Coastal cove",
        "choiceTitle": "Found a coastal settlement",
        "choiceLead": "Natural barriers tame the sea's temper and open new avenues of trade along the shore.",
        "choiceButton": "Commit to the coast",
        "tierLabels": {
          "camp": "Shore camp",
          "hamlet": "Coastal hamlet",
          "town": "Bay town",
          "city": "Port city"
        },
        "buildingLabels": {
          "gateway": "Quays & breakwater",
          "chapel": "Chapel",
          "market": "Harbor market",
          "walls": "Sea walls",
          "fields": "Salt gardens"
        },
        "buildingBlurbs": {
          "gateway": "Moorings and pilings — trade with the open water.",
          "fields": "Salt flats and shore gardens."
        },
        "buildingRallyPitch": {
          "gateway": "Drive pilings for the quay — the first ships will not wait forever.",
          "chapel": "Bless the breakwater and raise a chapel facing the bay.",
          "market": "Build a harbor market before the next caravan unloads in the rain.",
          "walls": "Stack sea walls against winter swells and smugglers.",
          "fields": "Start salt gardens and shore plots while tides are mild."
        },
      },
      "mountain": {
        "label": "Mountain pass",
        "choiceTitle": "Found a highland hold",
        "choiceLead": "A shoulder of granite above the timberline — defensible, austere, and watchful over every approach from pass or sea.",
        "choiceButton": "Commit to the mountains",
        "tierLabels": {
          "camp": "High camp",
          "hamlet": "Crag hamlet",
          "town": "Pass town",
          "city": "Highland city"
        },
        "buildingLabels": {
          "gateway": "Pass gate",
          "chapel": "Shrine of peaks",
          "market": "High market",
          "walls": "Crag walls",
          "fields": "Alpine terraces"
        },
        "buildingBlurbs": {
          "gateway": "Switchbacks and toll posts — the only road through the heights.",
          "fields": "Stone-walled terraces catching meltwater from the snows."
        },
        "buildingRallyPitch": {
          "gateway": "Cut a proper pass gate before winter seals the road.",
          "chapel": "Raise a shrine where ward-lamps can be seen from the valley floor.",
          "market": "Stock a high market — caravans pay dearly for shelter at altitude.",
          "walls": "Brace crag walls against avalanches and raiders from the peaks.",
          "fields": "Carve alpine terraces while the thaw still runs."
        },
      }
    },
    "buildings": {
      "gateway": {
        "label": "Trade gateway",
        "blurb": "Road terminus or quays.",
        "roleBoost": "mercenary",
        "rallyGoldCost": 28,
        "icon": "gateway"
      },
      "chapel": {
        "label": "Chapel",
        "blurb": "Stone altar and ward-lamps — morale for settlers.",
        "roleBoost": "priest",
        "rallyGoldCost": 22,
        "icon": "chapel"
      },
      "market": {
        "label": "Market square",
        "blurb": "Stalls and ledgers — merchants gather here.",
        "roleBoost": "mage",
        "rallyGoldCost": 25,
        "icon": "market"
      },
      "walls": {
        "label": "Palisade & wards",
        "blurb": "Timber walls and watch posts.",
        "roleBoost": "soldier",
        "rallyGoldCost": 30,
        "icon": "walls"
      },
      "fields": {
        "label": "Fields",
        "blurb": "Food for the settlement.",
        "roleBoost": null,
        "rallyGoldCost": 20,
        "icon": "fields"
      }
    },
    "tiers": [
      { "id": "camp", "label": "Settlement camp", "minPoints": 0 },
      { "id": "hamlet", "label": "Hamlet", "minPoints": 45 },
      { "id": "town", "label": "Town", "minPoints": 110 },
      { "id": "city", "label": "City", "minPoints": 220 }
    ],
    "passive": {
      "pointsPerSettlerPerDay": 0.18,
      "pointsPerPopulationPerDay": 0.025,
      "populationPerDayBase": 0.04,
      "populationPerSettlerPerDay": 0.22,
      "populationPerDeliveredCivilianPerDay": 0.04,
      "buildingProgressPerDayPerSettler": 0.06
    },
    "rally": {
      "progressBoost": 0.45,
      "pointsBonus": 10
    },
    "remoteOutpost": {
      "pointsPerSettler": 14,
      "roleBonus": { "priest": 5, "mage": 4, "soldier": 3, "mercenary": 3 }
    }
  },

  "stabilityTargetDays": 300,
  "finalBossMinDays": 270,
  "settlerRejoinCooldownDays": 365,
  "ruinSiteTypes": {
    "shrine": {
      "label": "Shrine",
      "splashTitle": "Roadside shrine",
      "splashSub": "Weathered stone and faded ward-symbols",
      "roomMin": 1,
      "roomMax": 8,
      "weight": 40,
      "unit": "room"
    },
    "temple": {
      "label": "Temple",
      "splashTitle": "Fallen temple",
      "splashSub": "Collapsed vaults and broken idol halls",
      "roomMin": 2,
      "roomMax": 10,
      "weight": 25,
      "unit": "room"
    },
    "ruined_castle": {
      "label": "Ruined castle",
      "splashTitle": "Ruined castle",
      "splashSub": "Broken towers and gutted great halls",
      "roomMin": 5,
      "roomMax": 15,
      "weight": 10,
      "unit": "room"
    },
    "abandoned_town": {
      "label": "Abandoned town",
      "splashTitle": "Abandoned town",
      "splashSub": "Empty lanes and fire-blackened homes — not worth rebuilding",
      "roomMin": 3,
      "roomMax": 5,
      "weight": 25,
      "unit": "house",
      "unitPlural": "houses"
    }
  },
  "source": "chart for game.xlsx",
  "classCreationBonusPoints": 3,
  "hpGrowthTuning": {
    "selectedModel": "optimal",
    "baseFormula": "hpGain = max(1, ceil(stamina/2) + rng(0..level) - k(level))",
    "models": {
      "conservative": {
        "k": "ceil(1.2 * level) + 2",
        "notes": "Lower survivability curve for harsher campaigns."
      },
      "optimal": {
        "k": "level + 1",
        "notes": "Current default. Balanced baseline for core progression."
      },
      "optimalA": {
        "k": "level",
        "notes": "Slightly faster than optimal for stress testing."
      }
    }
  },
  "classes": {
    "soldier": {
      "base": {
        "strength": 4,
        "intelligence": 4,
        "stamina": 4,
        "luck": 4
      },
      "bonus": {
        "strength": 3,
        "intelligence": -1,
        "stamina": 1,
        "luck": 0
      },
      "final": {
        "strength": 7,
        "intelligence": 3,
        "stamina": 5,
        "luck": 4
      }
    },
    "merchant": {
      "base": {
        "strength": 4,
        "intelligence": 4,
        "stamina": 4,
        "luck": 4
      },
      "bonus": {
        "strength": -1,
        "intelligence": 1,
        "stamina": 1,
        "luck": 2
      },
      "final": {
        "strength": 3,
        "intelligence": 5,
        "stamina": 5,
        "luck": 6
      }
    },
    "artisan": {
      "base": {
        "strength": 4,
        "intelligence": 4,
        "stamina": 4,
        "luck": 4
      },
      "bonus": {
        "strength": 0,
        "intelligence": 2,
        "stamina": -1,
        "luck": 2
      },
      "final": {
        "strength": 4,
        "intelligence": 6,
        "stamina": 3,
        "luck": 6
      }
    },
    "farmer": {
      "base": {
        "strength": 4,
        "intelligence": 4,
        "stamina": 4,
        "luck": 4
      },
      "bonus": {
        "strength": 1,
        "intelligence": 0,
        "stamina": 2,
        "luck": 0
      },
      "final": {
        "strength": 5,
        "intelligence": 4,
        "stamina": 6,
        "luck": 4
      }
    },
    "mercenary": {
      "base": {
        "strength": 4,
        "intelligence": 4,
        "stamina": 4,
        "luck": 4
      },
      "bonus": {
        "strength": 2,
        "intelligence": -1,
        "stamina": 1,
        "luck": 1
      },
      "final": {
        "strength": 6,
        "intelligence": 3,
        "stamina": 5,
        "luck": 5
      }
    },
    "priest": {
      "base": {
        "strength": 4,
        "intelligence": 4,
        "stamina": 4,
        "luck": 4
      },
      "bonus": {
        "strength": 0,
        "intelligence": 2,
        "stamina": 0,
        "luck": 1
      },
      "final": {
        "strength": 4,
        "intelligence": 6,
        "stamina": 4,
        "luck": 5
      }
    }
  },
  "monsters": [
    {
      "name": "Imp",
      "hp": 3,
      "mp": 2,
      "atk": 3,
      "type": "Wildlife",
      "level": 1
    },
    {
      "name": "Goblin",
      "hp": 5,
      "mp": null,
      "atk": 4,
      "type": "Demon",
      "level": 1
    },
    {
      "name": "Bandit",
      "hp": 6,
      "mp": null,
      "atk": 5,
      "type": "Humanoid",
      "level": 2
    },
    {
      "name": "Bandit Leader",
      "hp": 8,
      "mp": null,
      "atk": 7,
      "type": "Undead",
      "level": 2
    },
    {
      "name": "Bandit caster",
      "hp": 4,
      "mp": 10,
      "atk": 6,
      "type": "Mystical",
      "level": 2
    },
    {
      "name": "Skeleton",
      "hp": 3,
      "mp": null,
      "atk": 4,
      "type": null,
      "level": 1
    },
    {
      "name": "Skeleton King",
      "hp": 15,
      "mp": 30,
      "atk": 7,
      "type": null,
      "level": 3
    },
    {
      "name": "Undead",
      "hp": 6,
      "mp": null,
      "atk": 5,
      "type": null,
      "level": 2
    },
    {
      "name": "Wraith",
      "hp": 8,
      "mp": null,
      "atk": 6,
      "type": null,
      "level": 2
    },
    {
      "name": "Lich",
      "hp": 10,
      "mp": 20,
      "atk": 9,
      "type": null,
      "level": 2
    },
    {
      "name": "Lich King",
      "hp": 25,
      "mp": 40,
      "atk": 13,
      "type": null,
      "level": 3
    },
    {
      "name": "Wolf",
      "hp": 4,
      "mp": null,
      "atk": 3,
      "type": null,
      "level": 1
    },
    {
      "name": "Dire Wolf",
      "hp": 8,
      "mp": null,
      "atk": 5,
      "type": null,
      "level": 2
    },
    {
      "name": "Dread Wolf",
      "hp": 12,
      "mp": null,
      "atk": 7,
      "type": null,
      "level": 3
    },
    {
      "name": "Bear",
      "hp": 6,
      "mp": null,
      "atk": 4,
      "type": null,
      "level": 1
    },
    {
      "name": "Grizzly Bear",
      "hp": 12,
      "mp": null,
      "atk": 6,
      "type": null,
      "level": 1
    },
    {
      "name": "Golden Bear",
      "hp": 15,
      "mp": null,
      "atk": 8,
      "type": null,
      "level": 2
    },
    {
      "name": "Ghost Bear",
      "hp": 20,
      "mp": null,
      "atk": 12,
      "type": null,
      "level": 3
    },
    {
      "name": "Drake",
      "hp": 25,
      "mp": null,
      "atk": 8,
      "type": null,
      "level": 3
    },
    {
      "name": "Dragon",
      "hp": 100,
      "mp": 45,
      "atk": 25,
      "type": null,
      "level": 3
    },
    {
      "name": "Greater Dragon",
      "hp": 150,
      "mp": 60,
      "atk": 35,
      "type": null,
      "level": 3
    },
    {
      "name": "Titan",
      "hp": 60,
      "mp": 50,
      "atk": 26,
      "type": null,
      "level": 3
    },
    {
      "name": "Ghost",
      "hp": 5,
      "mp": null,
      "atk": 2,
      "type": null,
      "level": 1
    },
    {
      "name": "Demon",
      "hp": 13,
      "mp": 15,
      "atk": 6,
      "type": null,
      "level": 2
    },
    {
      "name": "Balor",
      "hp": 25,
      "mp": 32,
      "atk": 13,
      "type": null,
      "level": 2
    },
    {
      "name": "Troll",
      "hp": 6,
      "mp": null,
      "atk": 5,
      "type": null,
      "level": 1
    },
    {
      "name": "Ogre",
      "hp": 9,
      "mp": null,
      "atk": 8,
      "type": null,
      "level": 2
    },
    {
      "name": "soldiers",
      "hp": 9,
      "mp": null,
      "atk": 4,
      "type": null,
      "level": 2
    },
    {
      "name": "knight",
      "hp": 14,
      "mp": null,
      "atk": 5,
      "type": null,
      "level": 2
    },
    {
      "name": "mage",
      "hp": 7,
      "mp": 12,
      "atk": 5,
      "type": null,
      "level": 2
    },
    {
      "name": "cleric",
      "hp": 8,
      "mp": 8,
      "atk": 4,
      "type": null,
      "level": 2
    },
    {
      "name": "priest",
      "hp": 6,
      "mp": 10,
      "atk": 3,
      "type": null,
      "level": 2
    }
  ],
  "weapons": [
  {
    "name": "Iron Sword",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "common",
    "id": "iron_sword",
    "purchase": true,
    "buyPrice": 10,
    "sellPrice": 3
  },
  {
    "name": "Steel Sword",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "uncommon",
    "id": "steel_sword",
    "purchase": true,
    "buyPrice": 20,
    "sellPrice": 4
  },
  {
    "name": "Flamebrand",
    "group": "swords",
    "dmgModifier": 6,
    "extras": [
      "1 fire"
    ],
    "rarity": "rare",
    "id": "flamebrand",
    "purchase": false,
    "sellPrice": 8
  },
  {
    "name": "Icebrand",
    "group": "swords",
    "dmgModifier": 6,
    "extras": [
      "1 ice"
    ],
    "rarity": "rare",
    "id": "icebrand",
    "purchase": false,
    "sellPrice": 8
  },
  {
    "name": "Lightning Blade",
    "group": "swords",
    "dmgModifier": 6,
    "extras": [
      "1 lit"
    ],
    "rarity": "rare",
    "id": "lightning_blade",
    "purchase": false,
    "sellPrice": 8
  },
  {
    "name": "Vorpal Sword",
    "group": "swords",
    "dmgModifier": 6,
    "extras": [
      "1 water"
    ],
    "rarity": "rare",
    "id": "vorpal_sword",
    "purchase": false,
    "sellPrice": 8
  },
  {
    "name": "Bright Blade",
    "group": "swords",
    "dmgModifier": 5,
    "extras": [
      "1 holy"
    ],
    "rarity": "rare",
    "id": "bright_blade",
    "purchase": false,
    "sellPrice": 8
  },
  {
    "name": "Crystal Sword",
    "group": "swords",
    "dmgModifier": 7,
    "extras": [
      "2 holy"
    ],
    "rarity": "ultra_rare",
    "id": "crystal_sword",
    "purchase": false,
    "sellPrice": 15
  },
  {
    "name": "Falchion",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "common",
    "id": "falchion",
    "purchase": true,
    "buyPrice": 8,
    "sellPrice": 3
  },
  {
    "name": "Gladius",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "common",
    "id": "gladius",
    "purchase": true,
    "buyPrice": 12,
    "sellPrice": 3
  },
  {
    "name": "Arming Sword",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "uncommon",
    "id": "arming_sword",
    "purchase": true,
    "buyPrice": 15,
    "sellPrice": 4
  },
  {
    "name": "Longsword",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "uncommon",
    "id": "longsword",
    "purchase": true,
    "buyPrice": 18,
    "sellPrice": 4
  },
  {
    "name": "Broadsword",
    "group": "swords",
    "dmgModifier": 5,
    "extras": [],
    "rarity": "common",
    "id": "broadsword",
    "purchase": true,
    "buyPrice": 25,
    "sellPrice": 5
  },
  {
    "name": "Claymore",
    "group": "swords",
    "dmgModifier": 5,
    "extras": [],
    "rarity": "common",
    "id": "claymore",
    "purchase": true,
    "buyPrice": 30,
    "sellPrice": 5
  },
  {
    "name": "Rapier",
    "group": "swords",
    "dmgModifier": 2,
    "extras": [
      "3 crit"
    ],
    "rarity": "common",
    "id": "rapier",
    "purchase": true,
    "buyPrice": 10,
    "sellPrice": 2
  },
  {
    "name": "Katana",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [
      "2 crit"
    ],
    "rarity": "uncommon",
    "id": "katana",
    "purchase": true,
    "buyPrice": 25,
    "sellPrice": 6
  },
  {
    "name": "Estoc",
    "group": "swords",
    "dmgModifier": 2,
    "extras": [],
    "rarity": "common",
    "id": "estoc",
    "purchase": true,
    "buyPrice": 7,
    "sellPrice": 1
  },
  {
    "name": "Wakizashi",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "rare",
    "id": "wakizashi",
    "purchase": false,
    "sellPrice": 4
  },
  {
    "name": "Nodachi",
    "group": "swords",
    "dmgModifier": 5,
    "extras": [],
    "rarity": "rare",
    "id": "nodachi",
    "purchase": false,
    "sellPrice": 5
  },
  {
    "name": "Chokuto",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "rare",
    "id": "chokuto",
    "purchase": false,
    "sellPrice": 3
  },
  {
    "name": "Excalibur",
    "group": "swords",
    "dmgModifier": 8,
    "extras": [
      "3 holy"
    ],
    "rarity": "ultra_rare",
    "id": "excalibur",
    "purchase": false,
    "sellPrice": 15
  },
  {
    "name": "Dao",
    "group": "swords",
    "dmgModifier": 5,
    "extras": [],
    "rarity": "rare",
    "id": "dao",
    "purchase": false,
    "sellPrice": 6
  },
  {
    "name": "Hook Sword",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "uncommon",
    "id": "hook_sword",
    "purchase": true,
    "buyPrice": 13,
    "sellPrice": 2
  },
  {
    "name": "Scimitar",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "uncommon",
    "id": "scimitar",
    "purchase": true,
    "buyPrice": 16,
    "sellPrice": 3
  },
  {
    "name": "Shamshir",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "uncommon",
    "id": "shamshir",
    "purchase": true,
    "buyPrice": 14,
    "sellPrice": 2
  },
  {
    "name": "Talwar",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "rare",
    "id": "talwar",
    "purchase": false,
    "sellPrice": 8
  },
  {
    "name": "Khopesh",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "rare",
    "id": "khopesh",
    "purchase": false,
    "sellPrice": 7
  },
  {
    "name": "Urumi",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [
      "1 luck"
    ],
    "rarity": "rare",
    "id": "urumi",
    "purchase": false,
    "sellPrice": 8
  },
  {
    "name": "Takoba",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "rare",
    "id": "takoba",
    "purchase": false,
    "sellPrice": 7
  },
  {
    "name": "Shotel",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "rare",
    "id": "shotel",
    "purchase": false,
    "sellPrice": 8
  },
  {
    "name": "Flyssa",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "rare",
    "id": "flyssa",
    "purchase": false,
    "sellPrice": 8
  },
  {
    "name": "Barong",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [
      "1 str"
    ],
    "rarity": "rare",
    "id": "barong",
    "purchase": false,
    "sellPrice": 8
  },
  {
    "name": "Kampilan",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "rare",
    "id": "kampilan",
    "purchase": false,
    "sellPrice": 8
  },
  {
    "name": "Parang",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "uncommon",
    "id": "parang",
    "purchase": true,
    "buyPrice": 35,
    "sellPrice": 5
  },
  {
    "name": "Red Beard's Blade",
    "group": "swords",
    "dmgModifier": 2,
    "extras": [
      "2 luck",
      "2 water"
    ],
    "rarity": "uncommon",
    "id": "red_beard_s_blade",
    "purchase": true,
    "buyPrice": 36,
    "sellPrice": 5
  },
  {
    "name": "Tanto",
    "group": "swords",
    "dmgModifier": 2,
    "extras": [],
    "rarity": "uncommon",
    "id": "tanto",
    "purchase": true,
    "buyPrice": 12,
    "sellPrice": 2
  },
  {
    "name": "Dagger",
    "group": "swords",
    "dmgModifier": 1,
    "extras": [],
    "rarity": "common",
    "id": "dagger",
    "purchase": true,
    "buyPrice": 5,
    "sellPrice": 1
  },
  {
    "name": "Knife",
    "group": "swords",
    "dmgModifier": 1,
    "extras": [],
    "rarity": "common",
    "id": "knife",
    "purchase": true,
    "buyPrice": 3,
    "sellPrice": 1
  },
  {
    "name": "Butcher's Knife",
    "group": "swords",
    "dmgModifier": 2,
    "extras": [],
    "rarity": "common",
    "id": "butcher_s_knife",
    "purchase": true,
    "buyPrice": 5,
    "sellPrice": 1
  },
  {
    "name": "Machete",
    "group": "swords",
    "dmgModifier": 2,
    "extras": [],
    "rarity": "common",
    "id": "machete",
    "purchase": true,
    "buyPrice": 7,
    "sellPrice": 1
  },
  {
    "name": "Kris",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "uncommon",
    "id": "kris",
    "purchase": true,
    "buyPrice": 13,
    "sellPrice": 2
  },
  {
    "name": "War Axe",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "common",
    "id": "war_axe",
    "purchase": true,
    "buyPrice": 5,
    "sellPrice": 1
  },
  {
    "name": "Tomahawk",
    "group": "swords",
    "dmgModifier": 2,
    "extras": [
      "1 luck"
    ],
    "rarity": "common",
    "id": "tomahawk",
    "purchase": true,
    "buyPrice": 7,
    "sellPrice": 1
  },
  {
    "name": "Double-bit Battle Axe",
    "group": "swords",
    "dmgModifier": 5,
    "extras": [],
    "rarity": "common",
    "id": "double_bit_battle_axe",
    "purchase": true,
    "buyPrice": 14,
    "sellPrice": 1
  },
  {
    "name": "Christchurch Flail",
    "group": "swords",
    "dmgModifier": 5,
    "extras": [
      "1 holy"
    ],
    "rarity": "uncommon",
    "id": "christchurch_flail",
    "purchase": true,
    "buyPrice": 16,
    "sellPrice": 2
  },
  {
    "name": "Flail",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "common",
    "id": "flail",
    "purchase": true,
    "buyPrice": 7,
    "sellPrice": 1
  },
  {
    "name": "Round mace",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "common",
    "id": "round_mace",
    "purchase": true,
    "buyPrice": 9,
    "sellPrice": 1
  },
  {
    "name": "Blunted Mace",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "common",
    "id": "blunted_mace",
    "purchase": true,
    "buyPrice": 8,
    "sellPrice": 1
  },
  {
    "name": "Spiked Mace",
    "group": "swords",
    "dmgModifier": 4,
    "extras": [],
    "rarity": "common",
    "id": "spiked_mace",
    "purchase": true,
    "buyPrice": 10,
    "sellPrice": 1
  },
  {
    "name": "Guard Spear",
    "group": "swords",
    "dmgModifier": 3,
    "extras": [],
    "rarity": "common",
    "id": "guard_spear",
    "purchase": true,
    "buyPrice": 6,
    "sellPrice": 1
  },
  {
    "name": "Throwing Spear",
    "group": "swords",
    "dmgModifier": 2,
    "extras": [
      "1 luck"
    ],
    "rarity": "common",
    "id": "throwing_spear",
    "purchase": true,
    "buyPrice": 7,
    "sellPrice": 1
  }
],
  "statGainsPerClass": {
    "soldier": {
      "strength": 3,
      "intelligence": 1,
      "stamina": 2,
      "luck": 1
    },
    "merchant": {
      "strength": 1,
      "intelligence": 2,
      "stamina": 1,
      "luck": 3
    },
    "artisan": {
      "strength": 1,
      "intelligence": 1,
      "stamina": 1,
      "luck": 3
    },
    "farmer": {
      "strength": 2,
      "intelligence": 1,
      "stamina": 2,
      "luck": 2
    },
    "mercenary": {
      "strength": 3,
      "intelligence": 2,
      "stamina": 1,
      "luck": 2
    },
    "priest": {
      "strength": 1,
      "intelligence": 2,
      "stamina": 1,
      "luck": 1
    },
    "mage": {
      "strength": 1,
      "intelligence": 4,
      "stamina": 2,
      "luck": 4
    }
  },
  "levelXpThresholds": [
    0,
    3,
    7,
    13,
    21,
    31,
    44,
    61,
    83,
    109,
    141,
    180,
    229,
    291,
    365,
    451,
    550,
    662,
    799,
    957,
    1142
  ],
  "maxLevel": 20,
  "statCap": 50,
  "npcDialogues": {
    "cantebury_governor": {
      "speaker": "Governor Kew Kumber",
      "title": "Governor of Cantebury",
      "portrait": "SK Kew Kumber.jpeg",
      "sheet": "Dialogue for Kew Kumber",
      "lines": [
        "You have my leave to march west. Keep the trade road open, report what you find beyond Hollow Banks, and do not tarry — rumors from New Isil grow worse each week.",
        "The westward march is not a parade route. If your caravan straggles or loots hamlets, you answer to me before you answer to any crown in Isil.",
        "New Isil may glitter, but the road thins brave folk every season. Send word when you have something true to report — not rumor, not tavern poetry.",
        "You return with fewer boots on the ground and more names for the memorial wall. I will not pretend that is victory, but it is honest work.",
        "Every soul you leave in New Isil is a nail in the settlement we are trying to raise. See that they are fit citizens, not refugees with swords."
      ]
    },
    "cantebury_chancellor": {
      "speaker": "Chancellor Aldric Venn",
      "title": "Chancellor",
      "portrait": "",
      "sheet": "Dialogue for Kew Kumber",
      "lines": [
        "Petitions stack on the governor's desk. If you need requisition papers or a seal for the garrison at Gustaf, see me before you depart — I can spare an hour, not a day.",
        "I track manifests, not miracles. Tell me who you are leaving in New Isil and I will open a ledger page for them.",
        "The crown quartermaster posts prices; I post accountability. Bring receipts, not heroic sighs.",
        "If you loop back from the bay with another caravan, bring the previous ledger's copy. We reconcile settlers before we reconcile supplies.",
        "Stability is arithmetic, Captain — mouths fed, walls manned, ledgers balanced. The governor wins speeches; I win seasons."
      ]
    }
  },
  "lootRarityWeights": {"common": 0.85, "uncommon": 0.1, "rare": 0.045, "ultra_rare": 0.005},
  "rarityRankings": {
    "common": {
      "label": "Common",
      "dropWeight": 0.85
    },
    "uncommon": {
      "label": "Uncommon",
      "dropWeight": 0.1
    },
    "rare": {
      "label": "Rare",
      "dropWeight": 0.045
    },
    "ultra_rare": {
      "label": "Ultra rare",
      "dropWeight": 0.005
    }
  },
  "equipmentCatalog": [
  {
    "id": "cloth_armor",
    "slot": "armor",
    "label": "Cloth armor",
    "defBonus": 1,
    "purchase": true,
    "buyPrice": 5,
    "sellPrice": 1
  },
  {
    "id": "leather_armor",
    "slot": "armor",
    "label": "Leather armor",
    "defBonus": 2,
    "purchase": true,
    "buyPrice": 8,
    "sellPrice": 2
  },
  {
    "id": "chain_armor",
    "slot": "armor",
    "label": "Chain armor",
    "defBonus": 4,
    "purchase": true,
    "buyPrice": 15,
    "sellPrice": 5
  },
  {
    "id": "plate_armor",
    "slot": "armor",
    "label": "Plate armor",
    "defBonus": 7,
    "purchase": true,
    "buyPrice": 30,
    "sellPrice": 5
  },
  {
    "id": "lucky_ring",
    "slot": "finger",
    "label": "Lucky ring",
    "luckBonus": 1
  },
  {
    "id": "seal_ring",
    "slot": "finger",
    "label": "Signet ring",
    "goldBonus": 0
  },
  {
    "id": "travel_charm",
    "slot": "neck",
    "label": "Road charm",
    "wardBonus": 1
  },
  {
    "id": "holy_medallion",
    "slot": "neck",
    "label": "Holy medallion",
    "healBonus": 1
  },
  {
    "id": "soldier_blade",
    "slot": "weapon",
    "label": "Soldier's blade",
    "dmgBonus": 1,
    "rarity": "common"
  },
  {
    "id": "travel_knife",
    "slot": "weapon",
    "label": "Travel knife",
    "dmgBonus": 1,
    "rarity": "common"
  },
  {
    "id": "settlement_blade",
    "slot": "weapon",
    "label": "Trail blade",
    "dmgBonus": 1,
    "rarity": "common"
  },
  {
    "id": "iron_sword",
    "slot": "weapon",
    "label": "Iron Sword",
    "dmgBonus": 3,
    "rarity": "common",
    "group": "swords"
  },
  {
    "id": "steel_sword",
    "slot": "weapon",
    "label": "Steel Sword",
    "dmgBonus": 4,
    "rarity": "uncommon",
    "group": "swords"
  },
  {
    "id": "flamebrand",
    "slot": "weapon",
    "label": "Flamebrand",
    "dmgBonus": 6,
    "rarity": "rare",
    "group": "swords",
    "extras": [
      "1 fire"
    ]
  },
  {
    "id": "icebrand",
    "slot": "weapon",
    "label": "Icebrand",
    "dmgBonus": 6,
    "rarity": "rare",
    "group": "swords",
    "extras": [
      "1 ice"
    ]
  },
  {
    "id": "lightning_blade",
    "slot": "weapon",
    "label": "Lightning Blade",
    "dmgBonus": 6,
    "rarity": "rare",
    "group": "swords",
    "extras": [
      "1 lit"
    ]
  },
  {
    "id": "vorpal_sword",
    "slot": "weapon",
    "label": "Vorpal Sword",
    "dmgBonus": 6,
    "rarity": "rare",
    "group": "swords",
    "extras": [
      "1 water"
    ]
  },
  {
    "id": "bright_blade",
    "slot": "weapon",
    "label": "Bright Blade",
    "dmgBonus": 5,
    "rarity": "rare",
    "group": "swords",
    "extras": [
      "1 holy"
    ]
  },
  {
    "id": "crystal_sword",
    "slot": "weapon",
    "label": "Crystal Sword",
    "dmgBonus": 7,
    "rarity": "ultra_rare",
    "group": "swords",
    "extras": [
      "2 holy"
    ]
  },
  {
    "id": "falchion",
    "slot": "weapon",
    "label": "Falchion",
    "dmgBonus": 3,
    "rarity": "common",
    "group": "swords"
  },
  {
    "id": "gladius",
    "slot": "weapon",
    "label": "Gladius",
    "dmgBonus": 3,
    "rarity": "common",
    "group": "swords"
  },
  {
    "id": "arming_sword",
    "slot": "weapon",
    "label": "Arming Sword",
    "dmgBonus": 4,
    "rarity": "uncommon",
    "group": "swords"
  },
  {
    "id": "longsword",
    "slot": "weapon",
    "label": "Longsword",
    "dmgBonus": 4,
    "rarity": "uncommon",
    "group": "swords"
  },
  {
    "id": "broadsword",
    "slot": "weapon",
    "label": "Broadsword",
    "dmgBonus": 5,
    "rarity": "common",
    "group": "swords"
  },
  {
    "id": "claymore",
    "slot": "weapon",
    "label": "Claymore",
    "dmgBonus": 5,
    "rarity": "common",
    "group": "swords"
  },
  {
    "id": "rapier",
    "slot": "weapon",
    "label": "Rapier",
    "dmgBonus": 2,
    "rarity": "common",
    "group": "swords",
    "extras": [
      "3 crit"
    ]
  },
  {
    "id": "katana",
    "slot": "weapon",
    "label": "Katana",
    "dmgBonus": 3,
    "rarity": "uncommon",
    "group": "swords",
    "extras": [
      "2 crit"
    ]
  },
  {
    "id": "estoc",
    "slot": "weapon",
    "label": "Estoc",
    "dmgBonus": 2,
    "rarity": "common",
    "group": "swords"
  },
  {
    "id": "wakizashi",
    "slot": "weapon",
    "label": "Wakizashi",
    "dmgBonus": 3,
    "rarity": "rare",
    "group": "swords"
  },
  {
    "id": "nodachi",
    "slot": "weapon",
    "label": "Nodachi",
    "dmgBonus": 5,
    "rarity": "rare",
    "group": "swords"
  },
  {
    "id": "chokuto",
    "slot": "weapon",
    "label": "Chokuto",
    "dmgBonus": 4,
    "rarity": "rare",
    "group": "swords"
  },
  {
    "id": "excalibur",
    "slot": "weapon",
    "label": "Excalibur",
    "dmgBonus": 8,
    "rarity": "ultra_rare",
    "group": "swords",
    "extras": [
      "3 holy"
    ]
  },
  {
    "id": "dao",
    "slot": "weapon",
    "label": "Dao",
    "dmgBonus": 5,
    "rarity": "rare",
    "group": "swords"
  },
  {
    "id": "hook_sword",
    "slot": "weapon",
    "label": "Hook Sword",
    "dmgBonus": 3,
    "rarity": "uncommon",
    "group": "swords"
  },
  {
    "id": "scimitar",
    "slot": "weapon",
    "label": "Scimitar",
    "dmgBonus": 4,
    "rarity": "uncommon",
    "group": "swords"
  },
  {
    "id": "shamshir",
    "slot": "weapon",
    "label": "Shamshir",
    "dmgBonus": 3,
    "rarity": "uncommon",
    "group": "swords"
  },
  {
    "id": "talwar",
    "slot": "weapon",
    "label": "Talwar",
    "dmgBonus": 4,
    "rarity": "rare",
    "group": "swords"
  },
  {
    "id": "khopesh",
    "slot": "weapon",
    "label": "Khopesh",
    "dmgBonus": 4,
    "rarity": "rare",
    "group": "swords"
  },
  {
    "id": "urumi",
    "slot": "weapon",
    "label": "Urumi",
    "dmgBonus": 3,
    "rarity": "rare",
    "group": "swords",
    "extras": [
      "1 luck"
    ]
  },
  {
    "id": "takoba",
    "slot": "weapon",
    "label": "Takoba",
    "dmgBonus": 4,
    "rarity": "rare",
    "group": "swords"
  },
  {
    "id": "shotel",
    "slot": "weapon",
    "label": "Shotel",
    "dmgBonus": 4,
    "rarity": "rare",
    "group": "swords"
  },
  {
    "id": "flyssa",
    "slot": "weapon",
    "label": "Flyssa",
    "dmgBonus": 3,
    "rarity": "rare",
    "group": "swords"
  },
  {
    "id": "barong",
    "slot": "weapon",
    "label": "Barong",
    "dmgBonus": 4,
    "rarity": "rare",
    "group": "swords",
    "extras": [
      "1 str"
    ]
  },
  {
    "id": "kampilan",
    "slot": "weapon",
    "label": "Kampilan",
    "dmgBonus": 4,
    "rarity": "rare",
    "group": "swords"
  },
  {
    "id": "parang",
    "slot": "weapon",
    "label": "Parang",
    "dmgBonus": 3,
    "rarity": "uncommon",
    "group": "swords"
  },
  {
    "id": "red_beard_s_blade",
    "slot": "weapon",
    "label": "Red Beard's Blade",
    "dmgBonus": 2,
    "rarity": "uncommon",
    "group": "swords",
    "extras": [
      "2 luck",
      "2 water"
    ]
  },
  {
    "id": "tanto",
    "slot": "weapon",
    "label": "Tanto",
    "dmgBonus": 2,
    "rarity": "uncommon",
    "group": "daggers"
  },
  {
    "id": "dagger",
    "slot": "weapon",
    "label": "Dagger",
    "dmgBonus": 1,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "knife",
    "slot": "weapon",
    "label": "Knife",
    "dmgBonus": 1,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "butcher_s_knife",
    "slot": "weapon",
    "label": "Butcher's Knife",
    "dmgBonus": 2,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "machete",
    "slot": "weapon",
    "label": "Machete",
    "dmgBonus": 2,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "kris",
    "slot": "weapon",
    "label": "Kris",
    "dmgBonus": 3,
    "rarity": "uncommon",
    "group": "daggers"
  },
  {
    "id": "axe",
    "slot": "weapon",
    "label": "Axe",
    "dmgBonus": 1,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "war_axe",
    "slot": "weapon",
    "label": "War Axe",
    "dmgBonus": 3,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "tomahawk",
    "slot": "weapon",
    "label": "Tomahawk",
    "dmgBonus": 2,
    "rarity": "common",
    "group": "daggers",
    "extras": [
      "1 luck"
    ]
  },
  {
    "id": "double_bit_battle_axe",
    "slot": "weapon",
    "label": "Double-bit Battle Axe",
    "dmgBonus": 5,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "mace",
    "slot": "weapon",
    "label": "Mace",
    "dmgBonus": 1,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "christchurch_flail",
    "slot": "weapon",
    "label": "Christchurch Flail",
    "dmgBonus": 5,
    "rarity": "uncommon",
    "group": "daggers",
    "extras": [
      "1 holy"
    ]
  },
  {
    "id": "flail",
    "slot": "weapon",
    "label": "Flail",
    "dmgBonus": 3,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "round_mace",
    "slot": "weapon",
    "label": "Round mace",
    "dmgBonus": 4,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "blunted_mace",
    "slot": "weapon",
    "label": "Blunted Mace",
    "dmgBonus": 4,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "spiked_mace",
    "slot": "weapon",
    "label": "Spiked Mace",
    "dmgBonus": 4,
    "rarity": "common",
    "group": "daggers"
  },
  {
    "id": "guard_spear",
    "slot": "weapon",
    "label": "Guard Spear",
    "dmgBonus": 3,
    "rarity": "common",
    "group": "spears"
  },
  {
    "id": "throwing_spear",
    "slot": "weapon",
    "label": "Throwing Spear",
    "dmgBonus": 2,
    "rarity": "common",
    "group": "spears",
    "extras": [
      "1 luck"
    ]
  }
]
};
