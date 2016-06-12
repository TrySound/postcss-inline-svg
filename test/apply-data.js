import test from 'ava';
import applyData from '../dist/lib/apply-data';

/* eslint-disable max-len */
let tests = [{
    fixture: `
        <?xml version="1.0" encoding="utf-8"?>
        <!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
        <svg x="0px" y="0px" width="612px" height="612px" viewBox="8 205.9 612 612">
            <path d="M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9
                z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z"/>
        </svg>
    `,
    expected: `
        <?xml version="1.0" encoding="utf-8"?>
        <!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
        <svg x="0px" y="0px" width="612px" height="612px" viewBox="8 205.9 612 612">
            <path d="M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9
                z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z"/>
        </svg>
    `
}, {
    fixture: `
        <?xml version="1.0" encoding="utf-8"?>
        <svg x="0px" y="0px" width="612px" height="612px" viewBox="8 205.9 612 612">
            <path d="M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9
                z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z"/>
        </svg>
    `,
    root: {
        fill: '#000',
        stroke: '#f0f'
    },
    expected: `
        <?xml version="1.0" encoding="utf-8"?>
        <svg x="0px" y="0px" width="612px" height="612px" viewBox="8 205.9 612 612" fill="#000" stroke="#f0f">
            <path d="M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9
                z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z"/>
        </svg>
    `
}, {
    fixture: `
        <?xml version="1.0" encoding="utf-8"?>
        <svg x="0px" y="0px" width="612px" height="612px" viewBox="8 205.9 612 612">
            <path d="M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9
                z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z"/>
        </svg>
    `,
    selectors: {
        path: {
            height: '15px'
        }
    },
    expected: `
        <?xml version="1.0" encoding="utf-8"?>
        <svg x="0px" y="0px" width="612px" height="612px" viewBox="8 205.9 612 612">
            <path d="M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9
                z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z" height="15px"/>
        </svg>
    `
}, {
    fixture: `
        <svg x="0px" y="0px" width="612px" height="612px" viewBox="8 205.9 612 612">
            <g class="group-class">
                <g>
                    <path class="path-class" d="M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9
                        z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z"/>
                </g>
            </g>
        </svg>
    `,
    selectors: {
        '.path-class': {
            fill: '#000',
            stroke: 'currentColor'
        },
        '.group-class': {
            fill: 'currentColor'
        }
    },
    expected: `
        <svg x="0px" y="0px" width="612px" height="612px" viewBox="8 205.9 612 612">
            <g class="group-class" fill="currentColor">
                <g>
                    <path class="path-class" d="M160.9,498.4l19.6,19.6l119.7-120.1v267h27.7V398l119.7,120.1l19.6-19.6L314,344.9L160.9,498.4z M620,205.9H8v612h612V205.9
                        z M35.8,790.1V233.7h556.4v556.4H35.8L35.8,790.1z" fill="#000" stroke="currentColor"/>
                </g>
            </g>
        </svg>
    `
}];
/* eslint-enable max-len */

tests.forEach((item, i) => {
    test(`#${i + 1}`, t => {
        let result = applyData(item.fixture, item);
        t.is(result, item.expected);
    });
});
