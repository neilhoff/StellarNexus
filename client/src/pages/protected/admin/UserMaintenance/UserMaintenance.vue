<template>
  <q-page>
    <page-header title="User Maintenance" />

    <default-table
      :selected="selectedUsers"
      selection="multiple"
      row-key="email"
      tableName="Users"
      tableDescription="Manage user sign-in status"
      :tableColumns="tableColumns"
      :tableRows="tableRows"
      :nonFilteredTableRows="nonFilteredTableRows"
      @updateRows="setTableRows"
      @updateSelected="setSelectedUsers"
      @rowClick="onRowClick"
    >
      <template #title-description>
        <div class="text-h5 q-mr-md">Users</div>
        <div class="table-description q-mr-md">Manage user sign-in status</div>
      </template>
    </default-table>

    <q-dialog v-model="showUserDialog">
      <q-card style="min-width: 520px; max-width: 90vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">User Settings</div>
          <q-space />
          <q-btn flat icon="close" round v-close-popup />
        </q-card-section>

        <q-card-section v-if="dialogUser">
          <div class="text-caption q-mb-sm">Email</div>
          <div class="q-mb-md">{{ dialogUser.email }}</div>

          <q-input
            v-model="dialogUser.displayName"
            label="Display Name"
            outlined
            class="q-mb-md"
          />

          <q-toggle
            v-model="dialogUser.disabled"
            label="Disable Sign-In"
            color="negative"
          />

          <div class="q-mt-md text-caption">
            Created: {{ dialogUser.createdAt || 'N/A' }}<br>
            Last Sign-In: {{ dialogUser.lastSignInAt || 'N/A' }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Save" @click="saveDialogUser" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-inner-loading :showing="showSpinner">
      <default-spinner />
    </q-inner-loading>
  </q-page>
</template>

<script>
import { Notify } from 'quasar'
import PageHeader from 'src/components/PageHeader.vue'
import DefaultSpinner from 'src/components/DefaultSpinner.vue'
import DefaultTable from 'src/components/table/DefaultTable.vue'
import { userMaintenanceService } from 'src/services/protected/admin/userMaintenanceService.js'

export default {
  name: 'UserMaintenance',
  components: {
    PageHeader,
    DefaultSpinner,
    DefaultTable
  },
  data () {
    return {
      showSpinner: false,
      selectedUsers: [],
      tableRows: [],
      nonFilteredTableRows: [],
      showUserDialog: false,
      dialogUser: null,
      tableColumns: [
        { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
        { name: 'displayName', label: 'Display Name', field: 'displayName', align: 'left', sortable: true },
        {
          name: 'disabled',
          label: 'Sign-In',
          field: 'disabled',
          align: 'left',
          sortable: true,
          format: function (val) { return val ? 'Disabled' : 'Enabled' }
        },
        { name: 'createdAt', label: 'Created', field: 'createdAt', align: 'left', sortable: true },
        { name: 'lastSignInAt', label: 'Last Sign-In', field: 'lastSignInAt', align: 'left', sortable: true }
      ]
    }
  },
  async mounted () {
    await this.loadData()
  },
  methods: {
    setTableRows (rows) {
      this.tableRows = rows
    },
    setSelectedUsers (rows) {
      this.selectedUsers = rows
    },
    onRowClick (evt, row) {
      this.dialogUser = { ...row }
      this.showUserDialog = true
    },
    async loadData () {
      this.showSpinner = true
      try {
        const users = await userMaintenanceService.getUsers()
        this.nonFilteredTableRows = users
        this.tableRows = users
      } catch {
        Notify.create({
          type: 'negative',
          message: 'Failed to load user maintenance data'
        })
      } finally {
        this.showSpinner = false
      }
    },
    async saveDialogUser () {
      if (!this.dialogUser) return
      try {
        await userMaintenanceService.updateUser({
          email: this.dialogUser.email,
          displayName: this.dialogUser.displayName
        })
        await userMaintenanceService.setUserDisabled(
          this.dialogUser.email,
          Boolean(this.dialogUser.disabled)
        )
        this.showUserDialog = false
        await this.loadData()
        Notify.create({
          type: 'positive',
          message: 'User updated'
        })
      } catch {
        Notify.create({
          type: 'negative',
          message: 'Failed to update user'
        })
      }
    }
  }
}
</script>
