## 📘 DataView Dashboard Interface with File Integration

This outlines the interactive dashboard UI behavior and how it interacts with your backend APIs.

---

### 1️⃣ Step 1: Fetch Dashboard Files

**API Endpoint:**
```http
GET {{LOCALURL}}/services/DataView/dashboards/files
```

**Expected JSON Response:**
```json
{
  "connectFiles": [
    {
      "filename": "1234_5678_91011.xlsx",
      "timeStamp": "2025-02-12 17:30:54",
      "uuid": "a1334535-5565-41f2-a391-c48214d183d3"
    }
  ],
  "staticFiles": [],
  "triggerFiles": [],
  "selfComputeFiles": []
}
```

---

### 2️⃣ Step 2: UI Elements

#### 🔽 Dropdown 1: Select File Category (Dynamic)

- Parse keys from JSON response: `connectFiles`, `staticFiles`, `triggerFiles`, `selfComputeFiles`
- Render them as options:
  - ConnectFiles
  - StaticFiles
  - TriggerFiles
  - SelfComputeFiles

#### 🔽 Dropdown 2: Select File Name (Dependent)

- Populate files based on selection in dropdown 1
- Example: If "ConnectFiles" selected:
  - 1234_5678_91011.xlsx

---

### 3️⃣ Step 3: Handle File Click

On file selection:

- Extract:
  - file category (e.g., `connectFiles`)
  - file UUID (e.g., `a1334535-5565-41f2-a391-c48214d183d3`)

#### 🔁 Route by Category:
```http
/services/WareHouse/getConnectFile/{uuid}
/services/WareHouse/getTriggerFile/{uuid}
/services/WareHouse/getStaticFile/{uuid}
/services/WareHouse/getSelfComputeFile/{uuid}
```

- Fetch the file as base64/download and use it as a data generator

---

### 4️⃣ Step 4: Submit Dashboard with File Reference

While sending dashboard data:

```json
{
  "file": {
    "file_id": "a1334535-5565-41f2-a391-c48214d183d3",
    "type_of_file": "connectFiles"
  },
  "name": "mqtt_messages Dashboard",
  "widgets": [
    {
      "id": "widget-1744889456259",
      "type": "line",
      "title": "Temperature Trend"
    }
  ]
}
```

---

### 5️⃣ Step 5: Re-fetch File on Dashboard Load

- Use `file.file_id` and `file.type_of_file`
- Make appropriate API request to retrieve the file for widget data regeneration.

✅ Done!