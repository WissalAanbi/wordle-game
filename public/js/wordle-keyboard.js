class WordleKeyboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    static get observedAttributes() {
        return ['for', 'ok', 'swapped', 'error'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    getKeyClass(letter) {
        const okKeys = (this.getAttribute('ok') || '').toLowerCase().split("").filter(k => k);
        const swappedKeys = (this.getAttribute('swapped') || '').toLowerCase().split("").filter(k => k);
        const errorKeys = (this.getAttribute('error') || '').toLowerCase().split("").filter(k => k);

        if (okKeys.includes(letter.toLowerCase())) {
            return 'correct';
        } else if (swappedKeys.includes(letter.toLowerCase())) {
            return 'present';
        } else if (errorKeys.includes(letter.toLowerCase())) {
            return 'absent';
        } else{
            return '';
        }
    }

    render() {
        const keyboardLayout = [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
        ];

        let html = `
          <div class="keyboard-container">
        `;

        keyboardLayout.forEach(row => {
            html += `<div class="keyboard-row">`;

            row.forEach(key => {
                let keyLabel = key.toUpperCase();
                let keyWidth = '';

                if (key === 'enter' || key === 'backspace') {
                    keyWidth = 'wide';
                    keyLabel = key === 'enter' ? 'ENTER' : '⌫';
                }

                const letter = key.length === 1 ? key : key[0];
                const cssClass = this.getKeyClass(letter);

                html += `<button class="key ${cssClass} ${keyWidth}"
                          data-key="${key}"
                          aria-label="${keyLabel}">${keyLabel}</button>`;
            });

            html += `</div>`;
        });

        html += `</div>`;

        this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block;
            }
            .keyboard-container {
              max-width: 600px;
              margin: 0 auto;
              padding: 8px;
            }
            .keyboard-row {
              display: flex;
              justify-content: center;
              margin: 4px 0;
              gap: 6px;
            }
            .key {
              width: 36px;
              height: 58px;
              border-radius: 4px;
              border: none;
              font-weight: bold;
              font-size: 24px;
              cursor: pointer;
              text-transform: uppercase;
              transition: transform 0.1s, opacity 0.2s;
            }
            .key:hover {
              transform: scale(1.05);
            }
            .key:active {
              transform: scale(0.95);
            }
            .key.correct {
              background: #538d4e;
            }
            .key.present {
              background: #b59f3b;
            }
            .key.absent {
              background: #3a3a3c;
              opacity: 0.6;
            }
            .key.wide {
              width: 60px;
              font-size: 12px;
            }
            .key[data-key="enter"] {
              color: white;
              background: #02367e;
            }
          </style>
          ${html}
        `;

        console.log(this.getAttribute('for'));

        let targetInput = document.querySelector('#'+this.getAttribute('for'));
        let enterKey = this.shadowRoot.querySelector('.key[data-key="enter"]');

        function checkInputLength() {
            const value = targetInput.value;
            enterKey.style.opacity = (value.length >= 5) ?'1' : '0.1';
        }

        if (targetInput) {
            checkInputLength();
            targetInput.addEventListener('keyup', checkInputLength);
        }

        this.shadowRoot.querySelectorAll('.key').forEach(button => {
            button.addEventListener('click', (event) => {
                const key = event.currentTarget.getAttribute('data-key');

                if (key === 'enter') {
                    targetInput.closest('form').dispatchEvent(new Event('submit', { cancelable: true }));
                } else if (key === 'backspace') {
                    targetInput.value = targetInput.value.slice(0, -1);
                } else {
                    targetInput.value += key;
                }
                checkInputLength();
            });
        });
    }
}

customElements.define('wordle-keyboard', WordleKeyboard);
