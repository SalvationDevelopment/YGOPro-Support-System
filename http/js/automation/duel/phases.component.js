/*global React, ReactDOM */
class PhaseIndicator extends React.Component {
    constructor(state) {
        super();
        this.state = state;
        return this;
    }

    update(phaseUpdate) {
        this.state.phase = phaseUpdate;
    }

    button(number, id, text) {
        return React.createElement('button', {
            className: 'phaseindicator',
            id: id,
            key: id,
            onClick: function () {
                manualNextPhase(number);
            }
        }, text);
    }

    render() {
        const buttons = [
            this.button(0, 'drawphi', 'DP'),
            this.button(1, 'standbyphi', 'SP'),
            this.button(2, 'main1phi', 'M1'),
            this.button(3, 'battlephi', 'BP'),
            this.button(4, 'main2phi', 'M2'),
            this.button(5, 'endphi', 'EP'),
            this.button(6, 'nextturn', 'Opponent')
        ];

        return React.createElement('div', {
            'data-currentphase': this.state.phase,
            id: 'phaseindicator',
            key: 'phase-indicator'
        }, buttons);
    }
}