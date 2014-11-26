function makeBrick(left, top, brick) {
  var colors = { input: '#666', output: 'blue' };
  var rect = new fabric.Rect({
    width: 60,
    height: 40,
    strokeWidth: 5,
    fill: '#fff',
    stroke: colors[brick.behav]
  });

  var text = new fabric.Text(brick.name, {
    fontSize: 10,
    originX: 'center',
    originY: 'center'
  });

  var group = new fabric.Group([ rect, text ], {
    left: left,
    top: top,
  });

  group.hasControls = group.hasBorders = false;
  group.behav = brick.behav;
  group.attachedTo = brick.attachedTo || [];
  group.name = brick.name;
  group.lines = {};

  return group;
}

function makeLine(coords) {
  return new fabric.Line(coords, {
    fill: 'black',
    stroke: 'black',
    strokeWidth: 5,
    selectable: false,
  });
}

function makePort(name, input, output, mech) {
  return new joint.shapes.devs.Model({
      position: { x: 10, y: 50 },
      size: { width: 90, height: 90 },
      inPorts: input || ['Entrada'],
      outPorts: output || ['Saída'],
      name: name,
      attrs: {
          '.label': { text: name, 'ref-x': .55, 'ref-y': .2 },
          rect: { fill: '#2ECC71', rx: 5, ry: 5, 'stroke-width': 2 },
          '.inPorts circle': { fill: '#16A085', magnet: 'passive', mech: mech, type: 'input', name: name},
          '.outPorts circle': { fill: '#E74C3C', type: 'output', mech: mech, name: name},

      }
  });
}
