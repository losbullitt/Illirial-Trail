window.ILLIRIAL_BALANCE = {
  "version": "5.4.2",
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
      "hp": 45,
      "mp": 45,
      "atk": 15,
      "type": null,
      "level": 3
    },
    {
      "name": "Greater Dragon",
      "hp": 65,
      "mp": 60,
      "atk": 23,
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
      "extras": []
    },
    {
      "name": "Steel Sword",
      "group": "swords",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Flamebrand",
      "group": "swords",
      "dmgModifier": 6,
      "extras": [
        "1 fire"
      ]
    },
    {
      "name": "Icebrand",
      "group": "swords",
      "dmgModifier": 6,
      "extras": [
        "1 ice"
      ]
    },
    {
      "name": "Lightning Blade",
      "group": "swords",
      "dmgModifier": 6,
      "extras": [
        "1 lit"
      ]
    },
    {
      "name": "Vorpal Sword",
      "group": "swords",
      "dmgModifier": 6,
      "extras": [
        "1 water"
      ]
    },
    {
      "name": "Bright Blade",
      "group": "swords",
      "dmgModifier": 5,
      "extras": [
        "1 holy"
      ]
    },
    {
      "name": "Crystal Sword",
      "group": "swords",
      "dmgModifier": 7,
      "extras": [
        "2 holy"
      ]
    },
    {
      "name": "Falchion",
      "group": "swords",
      "dmgModifier": 3,
      "extras": []
    },
    {
      "name": "Gladius",
      "group": "swords",
      "dmgModifier": 3,
      "extras": []
    },
    {
      "name": "Arming Sword",
      "group": "swords",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Longsword",
      "group": "swords",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Broadsword",
      "group": "swords",
      "dmgModifier": 5,
      "extras": []
    },
    {
      "name": "Claymore",
      "group": "swords",
      "dmgModifier": 5,
      "extras": []
    },
    {
      "name": "Rapier",
      "group": "swords",
      "dmgModifier": 2,
      "extras": [
        "3 crit"
      ]
    },
    {
      "name": "Katana",
      "group": "swords",
      "dmgModifier": 3,
      "extras": [
        "2 crit"
      ]
    },
    {
      "name": "Estoc",
      "group": "swords",
      "dmgModifier": 2,
      "extras": []
    },
    {
      "name": "Wakizashi",
      "group": "swords",
      "dmgModifier": 3,
      "extras": []
    },
    {
      "name": "Nodachi",
      "group": "swords",
      "dmgModifier": 5,
      "extras": []
    },
    {
      "name": "Chokuto",
      "group": "swords",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Excalibur",
      "group": "swords",
      "dmgModifier": 8,
      "extras": [
        "3 holy"
      ]
    },
    {
      "name": "Dao",
      "group": "swords",
      "dmgModifier": 5,
      "extras": []
    },
    {
      "name": "Hook Sword",
      "group": "swords",
      "dmgModifier": 3,
      "extras": []
    },
    {
      "name": "Scimitar",
      "group": "swords",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Shamshir",
      "group": "swords",
      "dmgModifier": 3,
      "extras": []
    },
    {
      "name": "Talwar",
      "group": "swords",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Khopesh",
      "group": "swords",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Urumi",
      "group": "swords",
      "dmgModifier": 3,
      "extras": [
        "1 luck"
      ]
    },
    {
      "name": "Takoba",
      "group": "swords",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Shotel",
      "group": "swords",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Flyssa",
      "group": "swords",
      "dmgModifier": 3,
      "extras": []
    },
    {
      "name": "Barong",
      "group": "swords",
      "dmgModifier": 4,
      "extras": [
        "1 str"
      ]
    },
    {
      "name": "Kampilan",
      "group": "swords",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Parang",
      "group": "swords",
      "dmgModifier": 3,
      "extras": []
    },
    {
      "name": "Red Beard's Blade",
      "group": "swords",
      "dmgModifier": 2,
      "extras": [
        "2 luck",
        "2 water"
      ]
    },
    {
      "name": "Tanto",
      "group": "daggers",
      "dmgModifier": 2,
      "extras": []
    },
    {
      "name": "Dagger",
      "group": "daggers",
      "dmgModifier": 1,
      "extras": []
    },
    {
      "name": "Knife",
      "group": "daggers",
      "dmgModifier": 1,
      "extras": []
    },
    {
      "name": "Butcher's Knife",
      "group": "daggers",
      "dmgModifier": 2,
      "extras": []
    },
    {
      "name": "Machete",
      "group": "daggers",
      "dmgModifier": 2,
      "extras": []
    },
    {
      "name": "Kris",
      "group": "daggers",
      "dmgModifier": 3,
      "extras": []
    },
    {
      "name": "Axe",
      "group": "daggers",
      "dmgModifier": null,
      "extras": []
    },
    {
      "name": "War Axe",
      "group": "daggers",
      "dmgModifier": 3,
      "extras": []
    },
    {
      "name": "Tomahawk",
      "group": "daggers",
      "dmgModifier": 2,
      "extras": [
        "1 luck"
      ]
    },
    {
      "name": "Double-bit Battle Axe",
      "group": "daggers",
      "dmgModifier": 5,
      "extras": []
    },
    {
      "name": "Mace",
      "group": "daggers",
      "dmgModifier": null,
      "extras": []
    },
    {
      "name": "Christchurch Flail",
      "group": "daggers",
      "dmgModifier": 5,
      "extras": [
        "1 holy"
      ]
    },
    {
      "name": "Flail",
      "group": "daggers",
      "dmgModifier": 3,
      "extras": []
    },
    {
      "name": "Round mace",
      "group": "daggers",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Blunted Mace",
      "group": "daggers",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Spiked Mace",
      "group": "daggers",
      "dmgModifier": 4,
      "extras": []
    },
    {
      "name": "Guard Spear",
      "group": "spears",
      "dmgModifier": 3,
      "extras": []
    },
    {
      "name": "Throwing Spear",
      "group": "spears",
      "dmgModifier": 2,
      "extras": [
        "1 luck"
      ]
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
      "intelligence": 3,
      "stamina": 3,
      "luck": 3
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
  "statCap": 50
};
