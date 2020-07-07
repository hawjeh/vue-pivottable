import $ from 'jquery';
import ExportBtn from './ExportBtn';

export default {
  props: ['values', 'defaultValues'],
  mounted() {
    $(document).on('click', '.OuterDropDown', function() {
      showCheckboxes();
    });
    $(document).on('click', function(event) {
      hide(event);
    });
    for (var index in this.values) {
      this.selected.push({
        value: this.values[index],
        selected: this.selectedOrNot(this.values[index]),
      });
    }
    this.generateReport();
  },
  methods: {
    selectedOrNot(val) {
      return this.defaultValues.indexOf(val) !== -1;
    },
    toggleValue(value) {
      this.selected.map((x) => {
        if (value === x.value) {
          x.selected = !x.selected;
        }
      });
    },
    selectAll() {
      this.selected.map((x) => {
        x.selected = true;
      });
    },
    deselectAll() {
      this.selected.map((x) => {
        x.selected = false;
      });
    },
    generateReport() {
      var hidden = [];
      this.selected.map((x) => {
        if (x.selected == false) {
          hidden.push(x.value);
        }
      });
      this.$emit('input', hidden);
    },
    clearFields() {
      this.deselectAll();
      this.generateReport();
    },
  },
  data() {
    return {
      selected: [],
    };
  },
  render(h) {
    return h(
      'div',
      {
        staticClass: ['OuterBox'],
      },
      [
        h(
          //Drop Down List (with sample option)
          'span',
          {
            staticClass: ['OuterDropDown'],
          },
          [
            h(
              'span',
              {
                attrs: {
                  value: 'Sample option',
                },
              },
              [
                'Select Column Fields',
                h(
                  'span',
                  {
                    staticClass: ['OuterTriangle'],
                  },
                  '  ▾'
                ),
              ]
            ),
          ]
        ),
        h(
          //Actual Options
          'div',
          {
            staticClass: ['OuterFilterBox'],
          },
          [
            h(
              'a',
              {
                staticClass: ['pvtButton'],
                attrs: {
                  role: 'button',
                },
                on: {
                  click: () => this.selectAll(),
                },
              },
              `Select All`
            ),
            h(
              'a',
              {
                staticClass: ['pvtButton'],
                attrs: {
                  role: 'button',
                },
                on: {
                  click: () => this.deselectAll(),
                },
              },
              `Deselect All`
            ),
            h(
              'div',
              {
                staticClass: ['pvtCheckContainer'],
              },
              [
                this.selected.map((x) => {
                  const checked = x.selected;
                  return h(
                    'p',
                    {
                      class: {
                        selected: checked,
                      },
                      attrs: {
                        key: x.value,
                      },
                      on: {
                        click: () => this.toggleValue(x.value),
                      },
                    },
                    [
                      h('input', {
                        attrs: {
                          type: 'checkbox',
                        },
                        domProps: {
                          checked: checked,
                        },
                      }),
                      x.value,
                    ]
                  );
                }),
              ]
            ),
          ]
        ),
        h(
          //Generate Button
          'button',
          {
            staticClass: ['generatebtn'],
            attrs: {
              role: 'button',
            },
            on: {
              click: () => this.generateReport(),
            },
          },
          'Generate'
        ),
        h(
          //Clear Fields Button
          'button',
          {
            staticClass: ['clearbtn'],
            attrs: {
              role: 'button',
            },
            on: {
              click: () => this.clearFields(),
            },
          },
          'Clear'
        ),
        h(ExportBtn),
      ]
    );
  },
};

var expanded = false;

function showCheckboxes() {
  if (!expanded) {
    $('.OuterFilterBox').show();
    expanded = true;
  } else {
    $('.OuterFilterBox').hide();
    expanded = false;
  }
}

function hide(event) {
  if ($('.OuterDropDown') !== event.target && !$('.OuterFilterBox').has(event.target).length && !$('.OuterDropDown').has(event.target).length) {
    $('.OuterFilterBox').hide();
    expanded = false;
  }
}
