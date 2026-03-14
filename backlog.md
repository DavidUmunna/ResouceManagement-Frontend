## 🧾 Request Lifecycle (Staff + Accounts)(Completed)

| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| `REQ-001` | Staff Can Create Funding Request | Allow staff to submit a funding request with required fields (title, purpose, amount, department, etc.) | High | ---(Completed)
| `REQ-002` | Line Manager/Accounts Approves Request | Approvers can change the request status to "Accounts Approved", with optional comments | High |  ---(Completed)
| `REQ-003` | Approved Requests Appear in Accounts Dashboard | Show only requests with status `Accounts Approved` for schedule preparation | High |   ---(Completed)

---

## 🗓 Schedule Creation (Accounts)(Completed)

| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| `SCH-001` | Create New Schedule | Accounts can create a new funding schedule by selecting approved requests | High |
| `SCH-002` | View/Edit Draft Schedule | Accounts can view selected requests, remove any, and see the total amount | High |
| `SCH-003` | Submit Schedule to MD | Once finalized, the schedule is submitted to MD for review | High |
| `SCH-004` | Track Sent Schedules | View list of submitted schedules and their statuses (Returned, Approved, Funded, etc.) | Medium |

---

## 🧑‍💼 MD Review Workflow(Completed)

| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| `MD-001` | MD Sees All Submitted Schedules | Display a list of schedules with summary info (Schedule ID, Date, Total, etc.) | High |
| `MD-002` | MD Opens Schedule in Modal | Modal shows breakdown of requests with total and checkboxes to remove items | High |
| `MD-003` | MD Sends Back Modified Schedule | MD sends revised schedule back to Accounts; removed requests go to "On Hold" | High |
| `MD-004` | Removed Requests Go On Hold | Requests MD removed are tagged as `On Hold` and show in Accounts dashboard | High |

---

## 🧮 Funding & Rollover Logic

| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| `FD-001` | Accounts See "Awaiting funding" Requests | On-hold requests can be reviewed and added to future schedules | Medium |
| `FD-002` | Mark Funded Requests | After MD approval, Accounts can mark requests as `Funded` and attach payment details | Medium |
| `FD-003` | View Funding History | View/search historical schedules and requests with filters and status tracking | Low |

---

## 🛎 Notifications (Optional)

| ID | Title | Description | Priority |
|----|-------|-------------|----------|
| `NT-001` | Notify MD of New Schedule | Notify MD via dashboard/email when new schedule is submitted | Low |
| `NT-002` | Notify Accounts When MD Returns a Schedule | Triggered when MD sends revised schedule | Low |

---


## Edit Existing Request Modal 
 | ER-001 | staff makes a request to procurement department (completed)
 | ER-002 | procurement officer goes to request history to view existing requests(completed)
 |ER-003| Requests sent to procurement department glow light blue 
 |ER-004| procuremnt officer can edit the request by clicking a modal named "Edit" (completed)
 |ER-005| after editing is done, the submit button is clicked and the request is edited (completed)

