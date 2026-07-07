# 💳 S-ATM 💳 #
A web extension, built for Chrome-based browsers (such as Opera GX, Chrome,...) to help students have an easier time using College Board's Question Bank

## ⭐ Features ⭐ ##
- Automatic question question logging along with visual markers for "exported questions".
- Import/Export features to transfer/backup saved data
## 🤔 Why it was created 🤔 ##
### 1. Tracking questions ###
- Manually tracking exported questions take 3-5 minutes, which adds up.
- Optimization necessary if users want to manually log faster.
Not fully optimized, but an example of manual logging:

```
II:

- Last CID:
+ E: first 4, page 3.
+ M&H: first 6, page 4. (now scarce, last set finished firs 10 of page 8)

- Last INF:
+ E: first 2, page 3. (end)
+ M&H: first 7, page 6.

- Last CE:
+ E: first 10, page 5.
+ M&H: first 5, page 10.
...
```
### 2. Question Selection  ###
- Maintaining ratio of question difficulty was an annoyance.
- Additionally, work flow may be mistake prone, as it is a chain of actions: logging the exported questions, clearing filters, clearing previously selected questions, and exporting both a key version and a no-headers version 

## 🤹 Workflow 🤹 ##
- Questions user select are tracked.
- User confirms questions export.
- Tool saves the exported IDs, then mark questions with those IDs on the page.


## 😥 Limitations 😥 ##
- Flexibility (extension might break if College Board makes radical changes to their site)
- Requires some user intervention

## Demo ##
![Watch demo video](docs/assets/videos/auto_log_mark_demo.gif)

## 🔮 Future changes improvements 🔮 ##
- [ ] Fully implement automation feature.
- [ ] Add mistakes logging (IDs, specifications) + dashboards.
