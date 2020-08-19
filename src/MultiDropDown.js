import $ from "jquery";
import ExportBtn from "./ExportBtn";

export default {
  props: ["values", "defaultValues", "attrs"],
  created() {
    $(document).off('click')
    $(document)
      .on("click", ".OuterDropDown", function() {
        showCheckboxes();
      });
    $(document).on("click", function(event) {
      hide(event);
    });
    this.init();
  },
  watch: {
    attrs() {
      var list = this.attrs
      var current = this.options;
      
      if (list[0].fields.length > 0 || list[1].fields.length > 0 || list[2].fields.length > 0) {
        //map each each field in list
       Object.keys(list).map((option) => {
         list[option].fields.map((listitem) => {
          //check if listitem is not selected in options
          var boolitem = current[option].fields.filter((field) => field.value == listitem && !field.selected)
          var bool = boolitem.length > 0
          if (bool) {
            console.log(boolitem)
            //check if it was selected b4
            if (boolitem[0].selectedOther) {
              console.log(Object.keys(current).filter((x) => current[x].text != list[option].text))
              Object.keys(current).filter((x) => current[x].text != list[option].text)
              .map((item) => {
                console.log(item)
                var bool2 = current[item].fields.filter((y) => y.value == listitem && y.selected).length > 0;
                console.log(bool2)
                if (bool2) {
                  
                //if true then we toggle the checkboxes for the other option that is selected
                this.toggleOption(current[item].text);
                this.toggleValue(listitem)
                }

              })
            }
            //if true then we toggle the checkboxes
            this.toggleOption(current[option].text);
            this.toggleValue(listitem)  
          }
         })
      })
    }
  }
  },
  computed: {
    optionList() {
      return this.options
    }
  },
  methods: {
    // selectedOrNot(val) {
    //   return this.defaultValues.indexOf(val) !== -1;
    // },
    init() {
      this.options = [
        { text: "Row", fields: [] },
        { text: "Column", fields: [] },
        { text: "Table", fields: [] },
      ]

      this.options.map((x) => {
        for (var index in this.values) {
          x.fields.push({
            value: this.values[index],
            selected: false,
            selectedOther: false,
          });
        }
      });
      this.generateReport();
    },
    toggleValue(value) {
      //update current option filter
      this.options
        .filter((x) => x.text == this.optionSelected)[0]
        .fields.map((x) => {
          if (value === x.value && x.selectedOther == false) {
            x.selected = !x.selected;

            //update other option filter
            this.options
              .filter((j) => j.text != this.optionSelected)
              .map((option) => {
                option.fields.map((j) => {
                  if (j.value == value) j.selectedOther = !j.selectedOther;
                });
              });
          }
        });
    },
    toggleOption(value) {
      this.optionSelected = value;
    },
    selectHelper(type) {
      var marked = [];
      this.options
        .filter((x) => x.text == this.optionSelected)[0]
        .fields.filter((x) => x.selected == !type && x.selectedOther)
        .map((x) => {
          marked.push(x.value);
          x.selected = type;
        });

      this.options
        .filter((x) => x.text != this.optionSelected)
        .map((option) => {
          option.fields
            .filter((x) =>
              type ? x.selected == !type : x.selectedOther == !type
            )
            .map((x) => {
              if (marked.includes(x.value)) x.selectedOther = type;
            });
        });
    },
    selectAll() {
      var marked = [];
      this.options
        .filter((x) => x.text == this.optionSelected)[0]
        .fields.filter((x) => x.selected == false && !x.selectedOther)
        .map((x) => {
          marked.push(x.value);
          x.selected = true;
        });

      this.options
        .filter((x) => x.text != this.optionSelected)
        .map((option) => {
          option.fields
            .filter((x) => x.selected == false)
            .map((x) => {
              if (marked.includes(x.value)) x.selectedOther = true;
            });
        });
    },
    deselectAll() {
      var marked = [];
      this.options
        .filter((x) => x.text == this.optionSelected)[0]
        .fields.filter((x) => x.selected == true && !x.selectedOther)
        .map((x) => {
          marked.push(x.value);
          x.selected = false;
        });

      this.options
        .filter((x) => x.text != this.optionSelected)
        .map((option) => {
          option.fields
            .filter((x) => x.selectedOther == true)
            .map((x) => {
              if (marked.includes(x.value)) x.selectedOther = false;
            });
        });
    },
    generateReport() {
      var list = []

      this.options.map((option) => {
        list.push({
          type: option.text,
          fields: option.fields.filter((item) => item.selected == true)
          .map((x) => x.value)
        })
      })

      this.$emit("input", list);
    },
    clearFields() {
      
      this.init();
      this.optionSelected = "Table",

      this.$emit("clear");
    },
  },
  data() {
    return {
      options: null,
      optionSelected: "Table",
    };
  },
  render(h) {
    return h(
      "div",
      {
        staticClass: ["OuterBox"],
      },
      [
        h(
          //Drop Down List (with sample option)
          "span",
          {
            staticClass: ["OuterDropDown"],
          },
          [
            h(
              "span",
              {
                attrs: {
                  value: "Sample option",
                },
              },
              [
                "Select Column Fields",
                h(
                  "span",
                  {
                    staticClass: ["OuterTriangle"],
                  },
                  "  ▾"
                ),
              ]
            ),
          ]
        ),
        h(
          //Actual Options
          "div",
          {
            staticClass: ["OuterFilterBox"],
          },
          [
            h(
              "div",
              {
                staticClass: ["pvtOptionsContainer"],
              },
              [
                h(
                  "a",
                  {
                    staticClass: ["pvtButton"],
                    attrs: {
                      role: "button",
                    },
                    on: {
                      click: () => this.selectAll(),
                    },
                  },
                  `Select All`
                ),
                h(
                  "a",
                  {
                    staticClass: ["pvtButton"],
                    attrs: {
                      role: "button",
                    },
                    on: {
                      click: () => this.deselectAll(),
                    },
                  },
                  `Deselect All`
                ),
                h(
                  "div",
                  {
                    staticClass: ["pvtOptions"],
                  },
                  [
                    this.options.map((x) => {
                      const checked = this.optionSelected == x.text;
                      return h(
                        "label",
                        {
                          class: {
                            selected: checked,
                          },
                          attrs: {
                            key: x.value,
                          },
                          staticClass: ["pvtOption"],
                          on: {
                            click: () => this.toggleOption(x.text),
                          },
                        },
                        [
                          h("input", {
                            attrs: {
                              type: "radio",
                            },
                            domProps: {
                              checked: checked,
                            },
                          }),
                          x.text,
                        ]
                      );
                    }),
                  ]
                ),
              ]
            ),
            h(
              "div",
              {
                staticClass: ["pvtCheckContainer"],
              },
              [
                this.options
                  .filter((x) => x.text == this.optionSelected)[0]
                  .fields.map((x) => {
                    const checked = x.selected;
                    return h(
                      "p",
                      {
                        class: {
                          selected: x.selectedOther
                            ? x.selectedOther
                            : x.selected,
                        },
                        attrs: {
                          key: x.value,
                        },
                        on: {
                          click: () => this.toggleValue(x.value),
                        },
                      },
                      [
                        h("input", {
                          attrs: {
                            type: "checkbox",
                          },
                          domProps: {
                            checked: x.selectedOther
                              ? x.selectedOther
                              : x.selected,
                            disabled: x.selectedOther,
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
          "button",
          {
            staticClass: ["greenBtn exportBtn"],
            attrs: {
              role: "button",
            },
            on: {
              click: () => this.generateReport(),
            },
          },
          "Populate"
        ),
        h(
          //Clear Fields Button
          "button",
          {
            staticClass: ["clearbtn"],
            attrs: {
              role: "button",
            },
            on: {
              click: () => this.clearFields(),
            },
          },
          "Clear"
        ),
        h(ExportBtn)
      ]
    );
  },
};

var expanded = false;

function showCheckboxes() {
  if (!expanded) {
    $(".OuterFilterBox").show();
    expanded = true;
  } else {
    $(".OuterFilterBox").hide();
    expanded = false;
  }
}

function hide(event) {
  if (
    $(".OuterDropDown") !== event.target &&
    !$(".OuterFilterBox").has(event.target).length &&
    !$(".OuterDropDown").has(event.target).length
  ) {
    $(".OuterFilterBox").hide();
    expanded = false;
  }
}
