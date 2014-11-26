"use strict"

var debug;
angular.module('App', ['ionic'])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/')

  $stateProvider.state('login', {
    url: '/',
    templateUrl: 'login.html',
    controller: 'LoginCtrl'
  })
  $stateProvider.state('forgot-password', {
    url: '/forgot-password',
    templateUrl: 'forgot-password.html'
  })
  $stateProvider.state('app', {
    abstract: true,
    url: '/app',
    templateUrl: 'menu.html',
    controller: 'AppCtrl'
  })
  $stateProvider.state('app.main', {
    url: '/main',
    templateUrl: 'main.html',
    controller: 'MainCtrl'
  })
  $stateProvider.state('app.statistics', {
    url: '/statistics',
    templateUrl: 'statistics.html',
    controller: 'StatisticsCtrl'
  })
  $stateProvider.state('app.logic', {
    url: '/logic',
    templateUrl: 'logic.html',
    controller: 'LogicCtrl'
  })
})
.controller('LoginCtrl', function($scope, $rootScope, $state, $http, $ionicPopup) {
  $('input').on('keyup', function(e) {
    if(e.keyCode == 13) $scope.signIn({username: $('#login').val(), password: $('#passd').val()});

  });
  $http.post('/isAuth')
  .success(function(data, status, headers, config){
    if(data.auth) {
      $rootScope.username = data.name;
      $state.go('app.main');
    }
  });

  $scope.signIn = function(user) {
    if(!user || !user.username || !user.password || user.username == "" || user.password == "") {
      $scope.openPopup('Preencha todos os dados', 'Campo vazio');
      return false;
    }

    $http.post('/login', user)
    .success(function(data, status, headers, config){
      if(data.auth) {
        $rootScope.username = data.user;
        $state.go('app.main');
      } else {
        $scope.openPopup(data.msg);
      }
    })
    .error(function(data, status, headers, config){
      $scope.openPopup(data.msg);
    });
  };

  $scope.openPopup = function(msg, title, btns) {
    var popup = $ionicPopup.confirm({
      title: title || 'Erro',
      buttons: btns || [
        { text: 'OK' }
        /*{
          text: 'Recuperar dados',
          type: 'button-royal',
          onTap: function() {
            $state.go('forgotpassword');
          }
        }*/],
      template: '<p style="text-align:center;">' + msg
    });
    popup.then(function(res) {
      return true;

    });
  };

})
.controller('AppCtrl', function($scope, $rootScope, $state, $http, $ionicPopup) {
  $http.post('/isAuth')
  .success(function(data, status, headers, config){
    if(!data.auth) $state.go('login');
    $rootScope.username = data.name;
  });

  $scope.goTo = function(name) {
    $state.go(name);
  };
})
.controller('MainCtrl', function($scope, $rootScope, $state, $http, $ionicPopup) {
  var canvas = document.querySelector('#container');
  var ctx = canvas.getContext('2d');
  var data = [
    {
        value: 64,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "Utilizado"
    },
    {
        value: 36,
        color: "#FDB45C",
        highlight: "#FFC870",
        label: "Livre"
    }
  ];
  var options = {
    //Boolean - Whether we should show a stroke on each segment
    segmentShowStroke : true,

    //String - The colour of each segment stroke
    segmentStrokeColor : "#fff",

    //Number - The width of each segment stroke
    segmentStrokeWidth : 2,

    //Number - The percentage of the chart that we cut out of the middle
    percentageInnerCutout : 50, // This is 0 for Pie charts

    //Number - Amount of animation steps
    animationSteps : 30,

    //String - Animation easing effect
    animationEasing : "easeOut",

    //Boolean - Whether we animate the rotation of the Doughnut
    animateRotate : true,

    //Boolean - Whether we animate scaling the Doughnut from the centre
    animateScale : false,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"

  };
  var myDoughnutChart = new Chart(ctx).Doughnut(data,options);

})
.controller('StatisticsCtrl', function($scope, $rootScope, $state, $http, $ionicPopup) {
  var canvas = document.querySelector('#container');
  var ctx = canvas.getContext('2d');
  var data = {
    labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho"],
    datasets: [
      {
        label: "Horas/Mês",
        fillColor: "rgba(151,187,205,0.5)",
        strokeColor: "rgba(151,187,205,0.8)",
        highlightFill: "rgba(151,187,205,0.75)",
        highlightStroke: "rgba(151,187,205,1)",
        data: [28, 48, 40, 19, 86, 27, 90]
      }
    ]
  };

  var options = {
    //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
    scaleBeginAtZero : true,

    //Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : true,

    //String - Colour of the grid lines
    scaleGridLineColor : "rgba(0,0,0,.05)",

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - If there is a stroke on each bar
    barShowStroke : true,

    //Number - Pixel width of the bar stroke
    barStrokeWidth : 2,

    //Number - Spacing between each of the X value sets
    barValueSpacing : 5,

    //Number - Spacing between data sets within X values
    barDatasetSpacing : 1,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

  }

  var myBarChart = new Chart(ctx).Bar(data, options);

})
.controller('LogicCtrl', function($scope, $rootScope, $state, $http, $ionicPopup) {
  $scope.colors = { input: '#666', output: 'blue' };
  $scope.bricks = {
    timer_01: {type: 'timer', name: 'timer_01', behav: 'input' },
    lsensor_01: {type: 'relay', name: 'lsensor_01', behav: 'input' },
    relay_01: {type: 'relay', name: 'relay_01', behav: 'output' },

  };

  var graph = new joint.dia.Graph;
  var paper = new joint.dia.Paper({
    el: $('#container'),
    width: 850,
    height: 400,
    gridSize: 1,
    model: graph,
    markAvailable: true,
    //snapLinks: { radius: 50},
    defaultLink: new joint.dia.Link({
        //smooth: true,
        attrs: {
          '.connection': { 'stroke-width': 2 },
          '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }
        }
    }),
    validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
      debug = graph;
      //console.log(cellViewS.model.collection['_byId'][cellViewS.model.id]);
      //console.log(cellViewT.model.collection['_byId'][cellViewT.model.id]);
      graph.getLinks().forEach(function(link){
        var attr = link.attributes;
        if(attr.target.id) {
          console.log(attr.target.id);
          console.log(attr.source.id == cellViewS.model.id && attr.target.id == cellViewT.model.id);
          if(attr.source.id == cellViewS.model.id && attr.target.id == cellViewT.model.id) return false;

        }

      });
      //console.log(graph.findModelsFromPoint(linkView.sourcePoint));
      //console.log(graph.findModelsFromPoint(linkView.targetPoint));
      // Prevent linking from input ports.
      if (magnetS && magnetS.getAttribute('mech') === 'lsensor'
        && magnetT && magnetT.getAttribute('mech') === 'lamp') return false;
        
      if (magnetS && magnetS.getAttribute('type') === 'input') return false;
      // Prevent linking from output ports to input ports within one element.
      if (cellViewS === cellViewT) return false;
      // Prevent linking to input ports.
      if (magnetT && magnetT.getAttribute('type') === 'input') return true;


      if (magnetS && magnetS.getAttribute('mech') === 'operator'
        && magnetT && magnetT.getAttribute('mech') === 'lamp'
        && magnetT.getAttribute('type') === 'input'
        && magnetS.getAttribute('type') === 'output') return true;

      if (magnetS && magnetS.getAttribute('mech') === 'lsensor'
        && magnetT && magnetT.getAttribute('mech') === 'operator'
        && magnetT.getAttribute('type') === 'output'
        && magnetS.getAttribute('type') === 'input') return true;
    },
    validateMagnet: function(cellView, magnet) {
      // Note that this is the default behaviour. Just showing it here for reference.
      // Disable linking interaction for magnets marked as passive (see below `.inPorts circle`).
      return magnet.getAttribute('magnet') !== 'passive';
    }
  });
  paper.scale(1.5);
  var m1 = makePort('sensorLuz', [], null, 'lsensor');
  graph.addCell(m1);

  var m2 = makePort('operador', null, null, 'operator');
  m2.translate(210, 40);
  graph.addCell(m2);

  var m3 = makePort('lampada', null, [], 'lamp')
  m3.translate(450, 0);
  graph.addCell(m3);

  graph.on('change:source change:target', function(link) {
      var sourcePort = link.get('source').port;
      var sourceId = link.get('source').id;
      var sourceName = link.collection._byId[sourceId].attributes.name;

      var targetPort = link.get('target').port;
      var targetId = link.get('target').id;
      var targetName = link.collection._byId[targetId].attributes.name;
      var m = [
          'A <b>' + sourcePort,
          '</b> do elemento <b>' + sourceName,
          '</b> está conectada à <b>' + targetPort,
          '</b> do elemento <b>' + targetName + '</b>'
      ].join('');

      if(sourcePort && targetPort) out(m);
  });

  function out(m) {
    $('#output').html(m);
  }
})

.directive('draggable', function($document, $timeout) {
  return function(scope, element, attr) {
    var startX = 0, startY = 0, x = 0, y = 0, width =0, elementW = 0, elementH = 0, parentHeight, parentWidth;
    parentHeight = element.parent().prop('clientHeight');
    parentWidth = element.parent().prop('clientWidth');
    $timeout(function() {
      elementW = element.prop('clientWidth');
      elementH = element.prop('clientHeight');
    },200);

    element.on('dragstart', function(event) {
      // Prevent default dragging of selected content
      event.gesture.preventDefault();
      startX = event.gesture.center.pageX - x;
      startY = event.gesture.center.pageY - y;
      $document.on('drag', move);
      $document.on('dragend', release);
    });

    function move(event) {
      y = event.gesture.center.pageY - startY;
      x = event.gesture.center.pageX - startX;
      if (x >= 0 && x <= (parentWidth-elementW)) {
        element.css({
          left:  x + 'px'
        });
      }
      if (y >= 0 && y <= parentHeight-elementH) {
        element.css({
          top:  y + 'px'
        });
      }
    }

    function release() {
      $document.unbind('drag', move);
      $document.unbind('dragend', release);
    }
  };
})

;
