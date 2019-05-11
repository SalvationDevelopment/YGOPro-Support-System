const React = window.React,
    ReactDOM = window.ReactDOM,
    createElement = React.createElement;

function getImageProperties(state) {
    const player = (state.orientSlot) ? (state.player ? 0 : 1) : state.player,
        className = ['card', 'p' + player, state.location, 'i' + state.index],
        facedown = (state.position === 'FaceDownDefence' || state.position === 'FaceDownAttack'),
        src = (state.id && !facedown) ? 'http://127.0.0.1:8887/' + state.id + '.jpg' : 'img/textures/cover.jpg',
        style = {};

    if (state.location !== 'HAND') {
        style.zIndex = state.index;
    } else {
        const f = 75 / 0.8;
        let xCoord;

        if (state.handLocation < 6) {
            xCoord = (5.5 * f - 0.8 * f * state.handLocation) / 2 + 1.55 * f + state.index * 0.8 * f;
        } else {
            xCoord = 1.9 * f + state.index * 4.0 * f / (state.handLocation - 1);
        }
        style.left = String() + xCoord + 'px';
    }

    if (state.location === 'DECK' || state.location === 'EXTRA' || state.location === 'GRAVE' || state.location === 'REMOVED') {
        style.transform = 'translate3d(0, 0, ' + state.index + 'px)';
        style.zIndex = state.index;
    }

    if (state.location === 'MONSTERZONE' && state.overlayindex) {
        const offsetX = (state.overlayindex % 2) ? (-1) * (state.overlayindex + 1) * 3 : state.overlayindex + (-1) * 3,
            offsetY = state.overlayindex * 4;

        style.zIndex = -1 * state.overlayindex;
        style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px)';
    }

    if (state.attackmode) {
        className.push('attackglow');
    }

    return {
        className: className.join(' '),
        'data-position': state.position,
        'data-id': state.id,
        'data-uid': state.uid,
        'data-index': state.index,
        'reloaded': state.reloaded,
        'key': state.uid,
        'onError': function (event) {
            event.target.src = 'img/textures/unknown.jpg';
        },
        src,
        style
    };
}

function getCounterProperties(state) {
    const counters = (state.counters > 0 && state.location !== 'HAND') ? `${state.counters} Counters` : '',
        className = ['cardselectionzone', `p${state.player}`, state.location, `i${state.index}`],
        style = {
            'zIndex': state.index + 1
        };

    return {
        className: className.join(' '),
        'data-counters': counters,
        style
    };
}

/**
 * React Binding for dynamically updating a card image with animations.
 * @class
 */
class CardImage extends React.Component {
    constructor(state) {
        super();
        this.state = state;
        return this;
    }

    render() {
        const element = createElement('img', getImageProperties(this.state));
        return element;
    }
}
