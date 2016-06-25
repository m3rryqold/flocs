// @ngInject
angular.module('flocs.instructions')
.service('instructionsService', function ($q, $timeout, workspaceService) {

  var self = this;  // necessary to access this service in different calling contexts
  var instructions = {};
  var instructionsToShow = [];
  var instructionAreas = {};

  self.instructionsPlacements = {};

  self.settingInstructions = function(allInstructions, newInstructions) {
    // NOTE: currently, only behavior for new instructions is implemented,
    // other instructions are ignored (in future we would like to have a
    // possibility to see all previous instructions related to current task)
    var instructionsSet = $q.defer();
    angular.forEach(newInstructions, function(instruction) {
      var key = instruction.concept;
      instructions[key] = instruction;
      instructionsToShow.push(key);
    });
    findPlacementsForBlockInstructions();
    findPlacementForSnappingInstruction();
    // just let the dynamic instruction areas to be rendered, then resolve
    $timeout(instructionsSet.resolve);
    return instructionsSet.promise;
  };

  function findPlacementsForBlockInstructions() {
    self.instructionsPlacements.blocks = [];
    angular.forEach(instructions, function(instruction, key) {
      if (instruction.type == 'block') {
        var block = workspaceService.getBlockInToolbox(instruction.blockKey);
        self.instructionsPlacements.blocks.push({
          key: key,
          offset: block.getOffset(),
          size: block.getSize(),
        });
      }
    });
  }

  function findPlacementForSnappingInstruction() {
    var startBlock = workspaceService.getBlockInProgram('start');
    var startOffset = startBlock.getOffset();
    var startSize = startBlock.getSize();
    startOffset.y += 0.6 * startSize.height;
    startSize.width *= 0.3;
    startSize.height *= 0.8;
    self.instructionsPlacements.snapping = {
      offset: startOffset,
      size: startSize
    };
  }

  self.registerInstructionArea = function(area) {
    var key = area.key;
    instructionAreas[key] = area;
  };

  self.showingSelectedInstruction = function(key) {
    var instruction = instructions[key];
    if (!instruction) {
      throw(new Error('no instruction for key: ' + key));
    }
    var area = instructionAreas[key];
    if (!area) {
      throw(new Error('no registered instruction area for key: ' + key));
    }
    return area.showing(instruction);
  };


  self.showingScheduledInstructions = function() {
    var scheduledInstructionsSeen = $q.defer();

    var showNextInstructionIfAny = function() {
      if (instructionsToShow.length === 0) {
        scheduledInstructionsSeen.resolve();
      } else {
        var instructionKey = instructionsToShow.shift();
        self.showingSelectedInstruction(instructionKey)
            .then(showNextInstructionIfAny);
      }
    };

    showNextInstructionIfAny();
    return scheduledInstructionsSeen.promise;
  };
});
