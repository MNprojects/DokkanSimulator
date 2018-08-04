// --- Order of operations ---
// Percentage-based leader skills CHECK
// Flat leader skills CHECK
// Percentage-based start of turn passives CHECK
// This is where start of turn +ATK support passives go. CHECK
// This is also where nuking style passives are factored in. CHECK
// Flat start of turn passives CHECK
// Percentage-based links CHECK
// Flat links CHECK
// Ki multiplier CHECK
// Build-up passives CHECK
// On Attack/on SA percentage-based passives
// On Attack/on SA flat passives

// SA multiplier
// SA-based ATK increases are factored in here as flat additions to the SA multiplier.


// TODO: Refactor - Create function for 'applyMultiplier(card,multiplierName)' and 'applyFlat(card,flatName)'
// passing the name of the arguments from an array being looped over for the correct order of operations

class DokkanSim {

  // Returns an array containing a hash for each attack
  // Requires: [validCardObjectHash, number, ['leaderType', function], ['leaderType', function], ['linkName1','linkName2','etc'],[numberFloatPercentage, numberFlatKi, numberFlatAttack]]
  static singleSim(card, turnMaxInt, leaderSkillOneArray, leaderSkillTwoArray, activeLinksArray, teamPassivesArray) {
    let turnCount = 1;
    let damageArray = [];
    let linkSkillData = [1,1,1,1,1]
   
    let leaderSkillsArray = this.orderLeaderSkills(leaderSkillOneArray, leaderSkillTwoArray);
    leaderSkillsArray[0][1](card);
    leaderSkillsArray[1][1](card);
    for (turnCount; turnCount <= turnMaxInt; turnCount++) {
      let turnCrit = false;
      let turnAdditional = false;
      let attackCount = 1;
      let kiArray = this.generateKiArray();
      let turnDamage = { turnCount:[{ 'attack_count':, 'attack_value':, 'crit':, 'ki':}]};

      this.setCurrentKi(card, kiArray);
      this.checkMaxKi(card);
      this.activatePercentageTurnStartSkill(card);
      this.applyPercentageTeamPassive(card, teamPassivesArray);
      this.applyFlatTeamPassive(card, teamPassivesArray);
      
      this.activateNukeSkill(card);
      this.activateFlatTurnStartSkill(card);
      this.activatePercentageLinkSkills(card, activeLinksArray);
      this.activateFlatLinkSkills(card, activeLinksArray);
      this.checkMaxKi(card);
      this.setCurrentKiMultiplier(card);
      this.applyCurrentKiMultiplier(card);
      this.applyBuildUpPassive(card);
      this.attack(card);

      turnCrit = this.potentialSkillactivation(card,'crit');
      
      if (turnCrit) {
        turnCrit = this.critAttack(card);
        turnDamage = 
      } else {
        turnDamage.turnCount.attack_count = attackCount;
        { turnCount:[{ 'attack_count': attackCount, 'attack_value': card['currentAttack'], 'crit': turnCrit, 'ki': card.currentKi}]};
      }
     
      

      turnAdditional = this.potentialSkillactivation(card,'aa');
      
      if(turnAdditional) {
        let additionalCrit = false;
        attackCount++;
        turnDamage.turnCount[attackCount-1] = { 'attack_count': attackCount, 'attack_value': card['currentAttack'], 'crit': additionalCrit}
        
      }
    
      damageArray.push(turnDamage);
    }

    return damageArray;



  }

  // TODO: create database of link skills and search it for the appropriate buff
  static activateLinkSkill(card, linkSkillFunctionArray) {
    for (let i = 0; i < linkSkillFunctionArray.length; i++) {
      linkSkillFunctionArray[i](card);
    }
    return card;
  }

  // Puts the leader skills into a new array and 
  // orders them so flat skills are positioned before percentage skills.
  static orderLeaderSkills(leader1Array, leader2Array) {
    let leaderSkillsArray = [];
    if (leader2Array[0] == 'flat') {
      leaderSkillsArray.push(leader2Array);
      leaderSkillsArray.push(leader1Array);
    } else {
      leaderSkillsArray.push(leader1Array);
      leaderSkillsArray.push(leader2Array);
    }
    return leaderSkillsArray
  }

  // Checks if the character has a turnStart skill and runs it if so.
  static activatePercentageTurnStartSkill(card) {
    if (card.percentageTurnStart) {
      card.percentageTurnStart();
    }
    return card;
  }

  static applyFlatTeamPassive(card, teamPassivesArray) {
    card.currentKi += teamPassivesArray[0];
    card.currentAttack = card.currentAttack + teamPassivesArray[1];
    return card;
  }
  // check % calc
  static applyPercentageTeamPassive(card, teamPassivesArray) {
    card.currentAttack = card.currentAttack * teamPassivesArray[2] / 100;
    return card;
  }

  static generateKiArray() {
    let kiArray = [];
    kiArray.push(this.generateTypedKi());
    kiArray.push(this.generateKiType());
    kiArray.push(this.generateRainbowKi());
    return kiArray;
  }

  // Called in generateKiArray()
  // Returns a number
  static generateTypedKi() {
    // First number is the amount of ki, second is the chance of that number appearing. 
    // Adjust as needed.
    let weighting = { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.2, 5: 0.1, 6: 0.05, 7: 0.025, 8: 0.025 };
    let i;
    let table = [];
    for (i in weighting) {
      // The numbers the weighting is multiplied against should be equal
      // to the degree of accuracy of the values
      for (let j = 0; j < weighting[i] * 100; j++) {
        table.push(i);
      }
    }
    // Creates random number between 0 and the length of the table array
    let k = Math.floor(Math.random() * table.length);
    return parseInt(table[k]);
  }

  static generateKiType() {
    let typesArray = ['PHY', 'INT', 'TEQ', 'AGL', 'STR'];
    let l = Math.floor(Math.random() * typesArray.length);
    return typesArray[l];
  }
  static generateRainbowKi() {
    let weight = { 0: 0.3, 1: 0.2, 2: 0.1, 3: 0.1, 4: 0.1, 5: 0.1 };
    let i;
    let table = [];
    for (i in weight) {
      // The numbers the weighting is multiplied against should be equal
      // to the degree of accuracy of the values
      for (let j = 0; j < weight[i] * 100; j++) {
        table.push(i);
      }
    }
    // Creates random number between 0 and the length of the table array
    let k = Math.floor(Math.random() * table.length);
    return parseInt(table[k]);
  }


  static setCurrentKi(card, kiArray) {
    let bonusKi = 0;
    // Checks if the card has a bonus skill and runs it if so.
    // Expects a number to be returned that represents the number of additional ki.
    // e.g. LR SV gains +2 ki per rainbow orb. Given 2 rainbow orbs will return 4 to bonusKi
    // e.g. cont. the standard ki is calculated later in this function for the total of +6 ki 
    if (card.kiBonusSkill) {
      bonusKi = card.kiBonusSkill(kiArray);
    }
    // Doubles the amount of ki from orbs that are the same type as the char
    if (card['type'] === kiArray[1]) {
      kiArray[0] *= 2;
    }
    // Sets the currentKi
    card['currentKi'] = card['currentKi'] + kiArray[0] + kiArray[2] + bonusKi;
    return card;
  }

  // Makes sure the ki doesn't go higher than the max for that char
  static checkMaxKi(card) {
    if (card['currentKi'] > card['maxKi']) {
      card['currentKi'] = card['maxKi'];
    }
    return card;
  }

  static activateNukeSkill(card, kiArray) {
    if (card.nukeSkill) {
      card.nukeSkill(kiArray);
    }
    return card;
  }

  static activateFlatTurnStartSkill(card) {
    if (card.flatTurnStart) {
      card.flatTurnStart();
    }
    return card;
  }

  // Requires an array of the format:
  // ['Link Skill 1 Name', 'Link Skill 2 Name', 'etc']
  // Matches the name to the JSON store of links.
  static activatePercentageLinkSkills(card, activeLinksArray) {
    for (let i = 0; i < activeLinksArray.length; i++) {
      if (this.linkSkillData[activeLinksArray[i]][0] === 'percentage') {
        this.linkSkillData[activeLinksArray[i]][1](card);
      }
    }
  }

  static activateFlatLinkSkills(card, activeLinksArray) {
    for (let i = 0; i < activeLinksArray.length; i++) {
      if (linkSkillData[activeLinksArray[i]][0] === 'flat') {
        linkSkillData[activeLinksArray[i]][1](card);
      }
    }
  }

  static setCurrentKiMultiplier(card) {
    // e.g. 150% - 100 % / 12 - 4 = 6.25%
    let perKiMultiplier = (card['12KiMultiplier'] - 100) / (12 - card['neutralKiMultiplierValue']);
    // e.g. 11 - 4 = 7
    let kiPastNeutral = card['currentKi'] - card['neutralKiMultiplierValue'];
    // e.g. 6.25% * 7 + 100 / 100 = 1.4375%
    card['currentKiMultiplier'] = ((perKiMultiplier * kiPastNeutral + 100) / 100);
    return card;
  }

  static applyCurrentKiMultiplier(card) {
    card['currentAttack'] = card['currentAttack'] * card['currentKiMultiplier'];
    return card;
  }

  static applyBuildUpPassive(card) {
    if (card.buildUpPassive) {
      card['currentAttack'] *= card['buildUpPassive'];
    }
    return card;
  }

  static activateOnAttackPercentage(card) {
    if (card.onAttackPercentage) {
      card.onAttackPercentage();
    }
    return card;
  }

  static activateOnSAPercentage(card) {
    if (card.onSAPercentage) {
      card.onSAPercentage();
    }
    return card;
  }
  static activateOnAttackFlat(card) {
    if (card.onAttackFlat) {
      card.onAttackFlat();
    }
    return card;
  }

  static activateOnSAFlat(card) {
    if (card.onSAFlat) {
      card.onSAFlat();
    }
    return card;
  }

  static activateMultipleSA(card) {
    if (card.multipleSA) {
      card.multipleSA();
    }
    return card;
  }

  static applySAMultiplier(card) {
    card['currentAttack'] *= card['SAMultiplier']
    return card;
  }

  static attack(card) {
    if (card['currentKi'] >= card['minSAKi']) {
      this.activateOnSAPercentage(card);
      this.activateOnAttackPercentage(card);
      this.activateOnSAFlat(card);
      this.activateOnAttackFlat(card);
      this.activateMultipleSA(card);
      this.applySAMultiplier(card);
    } else {
      this.activateOnAttackPercentage(card);
      this.activateOnAttackFlat(card);
    }
  }

  // Returns a boolean based on whether the skill should activate or not
  static potentialSkillactivation(card, skillName) {
    let randomNumber = Math.floor(Math.random() * 100);
    if(randomNumber <= (card[skillName] * 2)) {
      return true;
    } else {
      return false;
    }
  }

}

//All the variable we want to expose outside needs to be property of "exports" object.
module.exports = DokkanSim;







class weird {


  // TODO think about return datastructure/info: character -> damage -> SA? -> crits? -> AA?
  // Follows the order of operations the game uses
  // Returns an array containing a hash for each attack: key = name, value = damage dealt that attack
  teamSim(teamArray, turnMax) {
    let turnCount = 0;
    let damageArray = [];
    teamLeaderSkills(teamArray);
    while (turnCount < turnMax) {
      let currentRotation = currentRotationGetter(teamArray, turnCount);
      // Sims each card individually
      for (let i = 0; i < currentRotation.length; i++) {
        turnStartSkill(currentRotation[i]);
        linkSkillsActivate(currentRotation[i]);
        onAttackSkill(currentRotation[i]);
        onSASkill(currentRotation[i]);

        // TODO: rethink attack functions
        simTurn(currentRotation[i]);

        afterAttackSkills(currentRotation[i]);
        afterSASkills(currentRotation[i]);
      }
      turnCount++;
    }
    return damageArray;
  }



  // Uses modular maths to find the current rotation and floater depending upon the current turnCount.
  currentRotationGetter(teamArray, turnCount) {
    currentRotation = [];
    if (turnCount % 2 === 0) {
      currentRotation = currentRotation.concat(teamArray[0]).concat(teamArray[1]).concat(teamArray[(turnCount % 3) + 4]);
    }
    else {
      currentRotation = currentRotation.concat(teamArray[2]).concat(teamArray[3]).concat(teamArray[(turnCount % 3) + 4]);
    }
    return currentRotation;
  }

  // Checks each card in the current rotation to see if they have a turnStart skill. Will run if they do.
  turnStartSkills(card) {
    if (card.turnStart()) {
      card.turnStart();
    }

  }


  // TODO
  // Checks the adjacent cards for equivalent Ki links and activates shared links.
  linkSkillsActivate(currentRotation) {

  }

  // Checks then activates onAttack skills for the current rotation
  onAttackSkills(currentRotation) {
    currentRotation.forEach(card => {
      if (card.onAttack()) { card.onAttack(); }
    });
  }

  // Checks then activates onSA skills for the current rotation
  onSASkills(currentRotation) {
    currentRotation.forEach(card => {
      if (card.onSA()) { card.onSA(); }
    });
  }

  // TODO
  // Returns the total damage integer for the turn after simulating the 
  // turn for either of the possible positions of the main rotation 
  simAttacks(currentRotation) {
    var turnDamage = 0;
    for (let i = 1; i <= 2; i++) {
      var currentCalc = 0;
      currentRotation.forEach(card => {
        if (card.currentKi >= card.minSAKi)
          currentCalc += SACalc(card);
        else
          currentCalc += card.attackCalc();
      })
      if (currentCalc > turnDamage) {
        turnDamage = currentCalc;
      }
      swapRotation(teamArray);
    }
    return turnDamage;
  }

  // Swaps the positions of the first and second card in the current rotation.
  // Used in turnSim() to see if more damage can be achieved in the current turn
  swapRotation(currentRotation) {
    [currentRotation[0], currentRotation[1]] = [currentRotation[1], currentRotation[0]];
  }

  // TODO
  // Returns the attack for a card given its current stats
  SACalc(card) {

  }

  // TODO
  attackCalc(card) {

  }

  // Returns an array with a length of the arguement. Simulates a random amount of Ki per turn.
  randomKiGen(arrayLength) {
    // First number is the amount of ki, second is the chance of that number appearing. 
    // Adjust as needed.
    weighting = { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.2, 5: 0.1, 6: 0.05, 7: 0.025, 8: 0.025 };
    var i;
    var j;
    table = [];
    for (i in weighting) {
      for (j = 0; j < weighting[i] * 10; j++) {
        table.push(i);
      }
    }
    var k = 0;
    kiTable = [];
    while (k < arrayLength) {
      kiTable.push(table[Math.floor(Math.random() * table.length)]);
      k++;
    }
    return kiTable;
  }

  addKi(rotationArray, kiArray) {

  }

  // Checks the given card for any afterAttack skills and runs them
  afterAttackSkills(card) {
    if (card.afterAttack()) {
      card.afterAttack();
    }
  }

  // Checks the given card for any afterSASkills skills and runs them
  afterSASkills(card) {
    if (card.afterSA()) {
      card.afterSA();
    }
  }

  // TODO
  // Simulates the attack of a single card
  singleCardSim(singleCard, turnMax, leaderSkillsArray) {
    let turnCount = 0;
    let damageArray = [];
    teamLeaderSkills(teamArray);
    while (turnCount < turnMax) {
      let currentRotation = currentRotationGetter(teamArray, turnCount);
      // Sims each card individually
      for (let i = 0; i < currentRotation.length; i++) {
        turnStartSkill(currentRotation[i]);
        linkSkillsActivate(currentRotation[i]);
        onAttackSkill(currentRotation[i]);
        onSASkill(currentRotation[i]);

        // TODO: rethink attack functions
        simTurn(currentRotation[i]);

        afterAttackSkills(currentRotation[i]);
        afterSASkills(currentRotation[i]);
      }
      turnCount++;
    }
    return damageArray;
  }

}