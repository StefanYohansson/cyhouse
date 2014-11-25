.controller('LogicCtrl', function($scope, $rootScope, $state, $http, $ionicPopup) {
  $scope.colors = { input: '#666', output: 'blue' };
  $scope.bricks = {
    timer_01: {type: 'timer', name: 'timer_01', behav: 'input' },
    lsensor_01: {type: 'relay', name: 'lsensor_01', behav: 'input' },
    relay_01: {type: 'relay', name: 'relay_01', behav: 'output' },

  };

  $scope.selected = [];
  $scope.groups = {};

  debug = $scope.canvas = this.__canvas = new fabric.Canvas('c', { selection: false });
  fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

  $scope.verifyAttach = function() {
    var selected = $scope.selected;
    if(selected.length != 2) return false;
    if(selected.length == 2 && selected[0].attachedTo.indexOf(selected[1].name) != -1) return false;
    if(selected.length == 2 && selected[1].attachedTo.indexOf(selected[0].name) != -1) return false;
    if(selected[0].behav == selected[1].behav) return false;
    return true;
  };

  $scope.verifyDetach = function() {
    var selected = $scope.selected;
    if(selected.length != 2) return false;
    if(selected.length == 2 && selected[0].attachedTo.indexOf(selected[1].name) != -1) return true;
    if(selected.length == 2 && selected[1].attachedTo.indexOf(selected[0].name) != -1) return true;
    if(selected[0].behav == selected[1].behav) return false;
    return false;
  };

  $scope.attach = function() {
    var selected = $scope.selected;
    var line = makeLine([selected[0].left, selected[0].top, selected[1].left, selected[1].top]);
    $scope.canvas.add(line);
    $scope.canvas.moveTo(line, 0);
    selected[0].lines[selected[1].name] = {line: line, point: '1'};
    selected[1].lines[selected[0].name] = {line: line, point: '2'};
    selected[0].attachedTo.push(selected[1].name);
    selected[1].attachedTo.push(selected[0].name);
    $scope.canvas.renderAll();

  };

  $scope.detach = function() {
    var selected = $scope.selected;
    $scope.canvas.remove(selected[0].lines[selected[1].name].line);
    delete selected[0].lines[selected[1].name];
    delete selected[1].lines[selected[0].name];
    selected[0].attachedTo.splice(selected[0].attachedTo.indexOf(selected[1].name), 1);
    selected[1].attachedTo.splice(selected[1].attachedTo.indexOf(selected[0].name), 1);
    $scope.canvas.renderAll();

  };

  var line = makeLine([ 250, 100, 250, 150 ]),
      line2 = makeLine([ 250, 150, 250, 225 ]),
      line3 = makeLine([ 250, 150, 175, 200 ]),
      line4 = makeLine([ 250, 150, 325, 200 ]);

  //$scope.canvas.add(line, line2, line3, line4);

  $scope.canvas.on('object:moving', function(e) {
    var p = e.target;

    for(var name in p.lines) {
      var obj = p.lines[name];
      if(obj.point == '1') obj.line.set({'x1': p.left, 'y1': p.top});
      if(obj.point == '2') obj.line.set({'x2': p.left, 'y2': p.top});

    }
    $scope.canvas.renderAll();
  });

  $scope.canvas.on('mouse:down', function(e) {
    var p = e.target;
    if(p) {
      if($scope.selected.indexOf(p) != -1) return;
      if($scope.selected.length == 2) {
        $scope.selected[0]._objects[0].stroke = $scope.colors[$scope.selected[0].behav];
        $scope.selected.shift();
      }
      p._objects[0].stroke = 'red';
      $scope.selected.push(p);
    } else {
      $scope.selected.forEach(function(brick) {
        brick._objects[0].stroke = $scope.colors[brick.behav];
      });
      $scope.selected = [];
    }
    $scope.$apply();
    $scope.canvas.renderAll();
  });

  var x = 40, y = 100;
  for(var brick in $scope.bricks) {
    $scope.groups[brick] = (makeBrick(x, y, $scope.bricks[brick]));
    $scope.canvas.add($scope.groups[brick]);
    x+=80;
  }
})

.directive('custom', function(){
  return {
    link: function($scope, element, attrs) {
      element[0].placeholder = attrs.pholder;
      element.bind('focus', function(){
        element[0].placeholder = '';
      });
      element.bind('blur', function(){
        element[0].placeholder = attrs.pholder;
      });

    },
  };
})
