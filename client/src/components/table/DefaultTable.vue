<template>
  <div>
    <q-table
      bordered
      class="q-mt-lg default-table"
      :columns="tableColumns"
      data-cy="default-table"
      flat
      key="defaultTableAnimation"
      no-data-label="No Records Found"
      :rows="tableRows"
      :row-key="rowKey"
      :rows-per-page-options="rowsPerPage"
      v-model:selected="selectedModel"
      :selection="selection"
      v-show="tableShow"
      :visible-columns="visibleColumns"
    >
      <template v-slot:top>
        <div class="q-table__title items-end q-mb-sm">
          <slot name="title-description">
            <div
              class="text-h5 q-mr-md"
              data-cy="default-table-title"
            >{{ tableName }}</div>
            <div
              class="table-description"
              data-cy="default-table-description"
            >{{ tableDescription }}</div>
          </slot>
        </div>
        <q-space />
        <!-- Manual table Filter -->
        <q-select
          class="q-mr-sm q-mb-sm"
          data-cy="default-table-filter"
          dense
          :display-value="filterModel && filterModel.length > 0 ? `${filterModel.length} filters selected` : ''"
          emit-value
          outlined
          :options="filterOptions"
          label="Filters"
          map-options
          multiple
          style="min-width: 250px;"
          v-if="filterOptions && showFilterDropdown"
          v-model="filterModel"
        >
          <template v-slot:before-options>
            <q-item
              class="q-py-sm"
              dense
            >
              <q-item-section>
                <div>
                  <q-badge
                    class="q-pa-sm filter-badge"
                    @click="clearFilters"
                    color="primary"
                    label="Clear Filters"
                  />
                </div>
              </q-item-section>
              <q-item-section side>
                <div>
                  <q-badge
                    class="q-pa-sm filter-badge"
                    @click="selectAllFilters"
                    color="primary"
                    label="Select All"
                  />
                </div>
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
            <q-item
              dense
              v-bind="itemProps"
            >
              <q-item-section>
                <q-item-label>{{ opt.label }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  :model-value="selected"
                  size="sm"
                  @update:model-value="toggleOption(opt)"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-input
          class="q-mr-sm q-mb-sm"
          data-cy="default-table-search"
          debounce="500"
          dense
          label="Search"
          outlined
          style="width: 300px;"
          type="text"
          v-model="searchModel"
          v-if="showSearch"
        />
        <q-select
          class="q-mr-sm q-mb-sm"
          data-cy="default-table-select-columns"
          dense
          :display-value="$q.lang.table.columns"
          emit-value
          map-options
          multiple
          option-value="name"
          :options="tableColumns"
          options-cover
          options-dense
          outlined
          style="min-width: 150px"
          v-model="visibleColumns"
        />
        <export-CSV
          class="q-mb-sm"
          :columns="exportCSVTableColumns ? exportCSVTableColumns : tableColumns"
          :rows="exportCSVTableRows ? exportCSVTableRows : tableRows"
        />
      </template>
      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            auto-width
            v-if="firstColNoTitle"
          />
          <!-- First column is a "Select All" when row selection option is enabled -->
          <q-th
            auto-width
            :props="props"
            v-if="selection !== 'none'"
          >
            <q-checkbox
              v-if="selection === 'multiple'"
              v-model="props.selected"
              dense
              @update:model-value="props.toggleSelection()"
            />
          </q-th>
          <q-th
            :key="col.name"
            :props="props"
            v-for="col in props.cols"
          >
            <span v-if="col.noFilter || !enableColumnFilters">
              {{ col.label }}
            </span>
            <span v-else>
              {{ col.label }}
              <!-- Column Filter -->
              <q-icon
                name="filter_list"
                class="q-pl-sm q-pr-sm cursor-pointer"
                :class="{ 'filtered-icon': columnFilters[col.name]?.length > 0 }"
                size="xs"
                @click.stop="toggleColumnFilter(col)"
              >
                <q-menu>
                  <div class="column-filter-menu">
                    <q-input
                      class="q-ma-sm"
                      debounce="500"
                      dense
                      outlined
                      placeholder="Search values..."
                      @update:model-value="updateColumnFilter()"
                      v-model="columnFilterSearch[col.name]"
                    />
                    <q-btn
                      class="q-ma-sm"
                      color="primary"
                      :disable="!columnFilters[col.name]?.length && !columnFilterSearch[col.name]"
                      label="Clear Filters"
                      outline
                      size="xs"
                      @click="clearColumnFilters(col)"
                    />
                    <q-infinite-scroll
                      @load="(index, done) => loadMoreColumnFilterOptions(col, index, done)"
                      :offset="250"
                      class="column-filter-menu"
                    >
                      <q-list dense>
                        <q-item
                          v-for="item in getColumnFilterOptions(col)"
                          :key="item.value"
                        >
                          <q-item-section>
                            <q-checkbox
                              dense
                              :label="item.label"
                              :model-value="columnFilters[col.name]?.includes(item.value)"
                              @update:model-value="toggleColumnFilterValue(col, item.value)"
                            />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-infinite-scroll>
                  </div>
                </q-menu>
              </q-icon>
            </span>
          </q-th>
        </q-tr>
      </template>
      <template
        v-for="(_, name) in $slots"
        #[name]="slotData"
      >
        <!-- Pass slot to grandchild: https://stackoverflow.com/a/71678136/756623 -->
        <slot
          :name="name"
          v-bind="slotData || {}"
        />
      </template>
    </q-table>
    <q-inner-loading :showing="showSpinner">
      <default-spinner />
    </q-inner-loading>
  </div>
</template>

<script>
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import DefaultSpinner from 'components/DefaultSpinner.vue'
import ExportCSV from 'components/table/ExportCSV.vue'

export default defineComponent({
  name: 'DefaultTable',
  components: {
    DefaultSpinner,
    ExportCSV
  },
  props: {
    exportCSVTableColumns: {
      type: Array,
      default: null
    },
    exportCSVTableRows: {
      type: Array,
      default: null
    },
    showFilterDropdown: {
      type: Boolean,
      default: true
    },
    filterOptions: {
      type: Array,
      default: null
    },
    enableColumnFilters: {
      type: Boolean,
      default: false
    },
    firstColNoTitle: {
      type: Boolean,
      default: false
    },
    initialFilterSelection: {
      type: Array,
      default: () => []
    },
    initialVisibleColumns: {
      type: Array,
      default: null
    },
    nonFilteredTableRows: {
      type: Array
    },
    rowKey: {
      type: String
    },
    rowsPerPage: {
      type: Array,
      default: () => [50, 100, 0]
    },
    selected: {
      type: Array,
      default: () => []
    },
    selection: {
      type: String,
      default: 'none'
    },
    showSpinner: {
      type: Boolean,
      default: false
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    tableColumns: {
      type: Array
    },
    tableDescription: {
      type: String
    },
    tableName: {
      type: String,
      default: 'Table'
    },
    tableRows: {
      type: Array
    },
    tableShow: {
      type: Boolean,
      default: true
    }
  },
  emits: ['updateRows', 'updateSelected', 'onSelection'],
  setup (props, { emit }) {
    const visibleColumns = ref([])
    const columnFilters = ref({})
    const columnFilterSearch = ref({})
    const columnFilterPage = ref({}) // Track pagination for each column

    function onSelection (context) {
      emit('onSelection', context)
    }

    const selected = ref(props.selected)
    const selectedModel = computed({
      get: () => selected.value,
      set: (val) => {
        selected.value = val
        emit('updateSelected', val)
      }
    })
    watch(() => props.selected,
      (newValue) => {
        selected.value = newValue
      }
    )

    // Manual and Column filter setup
    const filterSelection = ref(props.initialFilterSelection)
    const filterModel = computed({
      get: () => filterSelection.value,
      set: (val) => {
        filterSelection.value = val
        filterAndSearchTable(searchText.value, filterSelection.value)
      }
    })

    // Column Filtering
    function getUniqueColumnValues (col) {
      // Get the currently filtered rows based on other column filters
      const otherColumnFilters = Object.entries(columnFilters.value).filter(([key]) => key !== col.name)
      let filteredRows = [...(props.nonFilteredTableRows?.value ? props.nonFilteredTableRows.value : props.nonFilteredTableRows)]

      // Apply other column filters
      otherColumnFilters.forEach(([colName, selectedValues]) => {
        if (selectedValues.length > 0) {
          const otherCol = props.tableColumns.find(c => c.name === colName)
          if (otherCol) {
            filteredRows = filteredRows.filter(row => {
              const value = typeof otherCol.field === 'function'
                ? otherCol.field(row)
                : row[otherCol.field === void 0 ? otherCol.name : otherCol.field]
              const formattedValue = otherCol.format && typeof otherCol.format === 'function'
                ? otherCol.format(value)
                : (value === null || value === undefined ? '' : String(value))
              return selectedValues.some(selected => {
                const selectedFormattedValue = otherCol.format && typeof otherCol.format === 'function'
                  ? otherCol.format(selected)
                  : (selected === null || selected === undefined ? '' : String(selected))
                return formattedValue === selectedFormattedValue
              })
            })
          }
        }
      })

      // Create a map to group raw values by formatted values
      const formattedValueMap = new Map()
      filteredRows.forEach(row => {
        const rawValue = typeof col.field === 'function'
          ? col.field(row)
          : row[col.field === void 0 ? col.name : col.field]
        const strValue = rawValue === null || rawValue === undefined ? '' : String(rawValue)
        const formattedValue = col.format && typeof col.format === 'function'
          ? col.format(strValue)
          : (strValue || 'Empty')

        // Use the first raw value encountered for each formatted value
        if (!formattedValueMap.has(formattedValue)) {
          formattedValueMap.set(formattedValue, strValue)
        }
      })

      // Convert map to array of filter options
      const options = Array.from(formattedValueMap.entries()).map(([formattedValue, rawValue]) => {
        return {
          label: formattedValue,
          value: rawValue
        }
      })
      // Sort using sort function if available, otherwise fall back to localeCompare
      if (col.sort && typeof col.sort === 'function') {
        return options.sort((a, b) => col.sort(a.value, b.value, {}, {}))
      } else {
        return options.sort((a, b) => {
          if (typeof a.value === 'string') {
            return a.value.localeCompare(b.value)
          } else if (typeof a.value === 'number') {
            return a.value - b.value
          }
        })
      }
    }

    function getColumnFilterOptions (col) {
      const searchText = columnFilterSearch.value[col.name]?.toLowerCase() || ''
      const page = columnFilterPage.value[col.name]?.page || 1
      const pageSize = 10 // Number of items to load per page
      const values = getUniqueColumnValues(col)
      const filteredValues = searchText
        ? values.filter(item => item.label.toLowerCase().includes(searchText))
        : values
      const start = (page - 1) * pageSize
      const end = start + pageSize
      return filteredValues.slice(0, end)
    }

    function loadMoreColumnFilterOptions (col, index, done) {
      if (!columnFilterPage.value[col.name]) {
        columnFilterPage.value[col.name] = { page: 1 }
      }
      const searchText = columnFilterSearch.value[col.name]?.toLowerCase() || ''
      const values = getUniqueColumnValues(col)
      const filteredValues = searchText
        ? values.filter(item => item.label.toLowerCase().includes(searchText))
        : values
      const pageSize = 10
      const currentPage = columnFilterPage.value[col.name].page
      const totalItems = filteredValues.length
      const totalPages = Math.ceil(totalItems / pageSize)

      if (currentPage < totalPages) {
        columnFilterPage.value[col.name].page += 1
        done() // Continue loading more items
      } else {
        done(true) // Stop loading if no more items
      }
    }

    function toggleColumnFilter (col) {
      if (!columnFilters.value[col.name]) {
        columnFilters.value[col.name] = []
      }
      if (!columnFilterPage.value[col.name]) {
        columnFilterPage.value[col.name] = { page: 1 }
      }
    }

    function toggleColumnFilterValue (col, value) {
      if (!columnFilters.value[col.name]) {
        columnFilters.value[col.name] = []
      }
      const index = columnFilters.value[col.name].indexOf(value)
      if (index === -1) {
        columnFilters.value[col.name].push(value)
      } else {
        columnFilters.value[col.name].splice(index, 1)
      }
      filterAndSearchTable(searchText.value, filterSelection.value)
    }

    function clearColumnFilters (col) {
      columnFilters.value[col.name] = []
      columnFilterSearch.value[col.name] = ''
      filterAndSearchTable(searchText.value, filterSelection.value)
    }

    function updateColumnFilter () {
      filterAndSearchTable(searchText.value, filterSelection.value)
    }

    function filterRows (rows, filters) {
      let filteredRows = [...rows]

      Object.entries(columnFilters.value).forEach(([colName, selectedValues]) => {
        if (selectedValues.length > 0) {
          const col = props.tableColumns.find(c => c.name === colName)
          if (col) {
            filteredRows = filteredRows.filter(row => {
              const value = typeof col.field === 'function'
                ? col.field(row)
                : row[col.field === void 0 ? col.name : col.field]
              const formattedValue = col.format && typeof col.format === 'function'
                ? col.format(value)
                : (value === null || value === undefined ? '' : String(value))
              return selectedValues.some(selected => {
                const selectedFormattedValue = col.format && typeof col.format === 'function'
                  ? col.format(selected)
                  : (selected === null || selected === undefined ? '' : String(selected))
                return formattedValue === selectedFormattedValue
              })
            })
          }
        }
      })

      if (filters.length > 0) {
        let tempRows = []
        for (const filter of filters) {
          const filterOption = props.filterOptions.find(item => item.value === filter)
          const filteredItems = filterOption.fn(filteredRows)
          tempRows = [...tempRows, ...filteredItems]
        }
        filteredRows = tempRows
      }

      return filteredRows
    }

    function clearFilters () {
      filterModel.value = []
      columnFilters.value = {}
      columnFilterSearch.value = {}
      columnFilterPage.value = {} // Reset pagination
      filterAndSearchTable(searchText.value, [])
    }

    function selectAllFilters () {
      const all = props.filterOptions.map(opt => opt.value)
      filterModel.value = all
    }

    const searchText = ref()
    const searchModel = computed({
      get: () => searchText.value,
      set: (val) => {
        searchText.value = val
        filterAndSearchTable(searchText.value, filterSelection.value)
      }
    })

    function searchRows (rows, text) {
      let searchedRows
      if (text) {
        searchedRows = rows.filter((obj) => {
          return Object.values(obj).some((value) => {
            if (typeof value === 'string') {
              return value.toString().toLowerCase().includes(text.toLowerCase())
            } else {
              return null
            }
          })
        })
      } else {
        searchedRows = rows
      }
      return searchedRows
    }

    function filterAndSearchTable (searchText, filterSelection) {
      const nonFilteredRows = props.nonFilteredTableRows?.value ? props.nonFilteredTableRows.value : props.nonFilteredTableRows
      const searchedRows = searchRows(nonFilteredRows, searchText)
      const filteredRows = filterRows(searchedRows, filterSelection)
      emit('updateRows', filteredRows)
    }

    watch(() => props.tableColumns, () => {
      if (props.initialVisibleColumns) {
        visibleColumns.value = [...props.initialVisibleColumns]
      } else {
        visibleColumns.value = props.tableColumns.map(column => column.name)
      }
    }, { immediate: true })

    onMounted(() => {
      watch(() => props.nonFilteredTableRows, () => {
        if (props.initialFilterSelection.length > 0) {
          filterAndSearchTable(searchText.value, filterSelection.value)
        }
      }, { immediate: true })
    })

    return {
      visibleColumns,
      onSelection,
      selectedModel,
      filterModel,
      clearFilters,
      selectAllFilters,
      searchModel,
      filterAndSearchTable,
      columnFilters,
      columnFilterSearch,
      getColumnFilterOptions,
      toggleColumnFilter,
      toggleColumnFilterValue,
      clearColumnFilters,
      updateColumnFilter,
      loadMoreColumnFilterOptions
    }
  }
})
</script>

<style lang="scss" scoped>
.default-table {
  --animate-duration: 2s;
}

.table-description {
  font-size: .8rem;
}

.filter-badge {
  cursor: pointer;
}

.column-filter-menu {
  min-width: 200px;
  // max-height: 400px;
  overflow-y: auto;
}

.filtered-icon {
  font-weight: bold;
  color: $positive;
}
</style>
