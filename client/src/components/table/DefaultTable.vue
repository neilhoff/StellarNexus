<template>
  <div>
    <transition
      appear
      enter-active-class="animated fadeIn"
    >
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
        <!-- Pass slot to grandchild: https://stackoverflow.com/a/71678136/756623 -->
        <template
          v-for="(_, name) in $slots"
          #[name]="slotData"
        >
          <slot
            :name="name"
            v-bind="slotData || {}"
          />
        </template>
      </q-table>
    </transition>
    <q-inner-loading :showing="showSpinner">
      <default-spinner />
    </q-inner-loading>
  </div>
</template>

<script>
import { computed, defineComponent, ref, watch, onMounted } from 'vue'
import DefaultSpinner from 'components/DefaultSpinner'
import ExportCSV from 'components/table/ExportCSV'

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
      default: false
    }

  },
  emits: ['updateRows'],
  setup (props, { emit }) {
    const visibleColumns = ref([])

    const filterSelection = ref(props.initialFilterSelection)
    const filterModel = computed({
      get: () => filterSelection.value,
      set: (val) => {
        filterSelection.value = val
        filterAndSearchTable(searchText.value, filterSelection.value)
      }
    })
    function filterRows (rows, filters) {
      let filteredRows = []
      if (filters.length > 0) {
        // Go through each filter, find the option that matches and execute the function
        for (const filter of filters) {
          const filterOption = props.filterOptions.find(item => item.value === filter)
          const filteredItems = filterOption.fn(rows)
          filteredRows = [...filteredRows, ...filteredItems]
        }
      } else {
        filteredRows = [...rows]
      }

      return filteredRows
    }
    function clearFilters () {
      filterModel.value = []
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
          // Check if the text string is present in any of the object's properties
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
      const nonFilteredRows = props.nonFilteredTableRows.value ? props.nonFilteredTableRows.value : props.nonFilteredTableRows
      const searchedRows = searchRows(nonFilteredRows, searchText)
      const filteredRows = filterRows(searchedRows, filterSelection)
      emit('updateRows', filteredRows)
    }

    // Table columns are loaded async and we need to wait for them to set the visible columns
    // This should only run once since the tableColumns should never change after initial setting.
    watch(() => props.tableColumns, (current, prev) => {
      if (props.initialVisibleColumns) {
        visibleColumns.value = [...props.initialVisibleColumns]
      } else {
        visibleColumns.value = props.tableColumns.map(column => column.name)
      }
    }, { immediate: true })

    onMounted(() => {
      // Wait for the component to mount and nonFilteredTableRows value to be set and then
      // run the filter based on the initialFilterSelection.
      // This should only run once since nonFilteredTableRows should never change.
      watch(() => props.nonFilteredTableRows, (newValue, oldValue) => {
        if (props.initialFilterSelection.length > 0) {
          filterAndSearchTable(searchText.value, filterSelection.value)
        }
      }, { immediate: true })
    })

    return {
      visibleColumns,
      filterModel,
      clearFilters,
      selectAllFilters,
      searchModel,
      filterAndSearchTable
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
</style>
