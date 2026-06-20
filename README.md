# 💳 S-ATM 💳 #
A web extension, built for Chrome-based browsers (such as Opera GX, Chrome,...) to help students planning to take the SAT have an easier time using College Board's Question Bank

## ⭐ Features ⭐ ##
- Automatic question question logging along with visual markers for "exported questions".
- Automated question set generation from OFFICIAL SOURCES.

## 🤔 Why it was created 🤔 ##
### 1. Tracking questions ###
- Having to keep/maintain separate text file/notes to track questions you already completed on the question bank takes around 3-5 minutes each time, which adds up overtime
- In doing so, you might also have to had come up with abbreviated names, or conventions for easy + fast logging **manually**
- You'd also have to count top-down, or find the specific question IDs that you ended the last section on.
Here's what I did for example:

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
- I found it annoying having to change question filters repeatedly, since i wanted a mix of Easy, Medium, and Hard questions for different question categories as well.
- I noticed that this took me around 3-5 minutes every time I wanted to create a set of 12 questions.
- Additionally, there were also an abundance of mini-tasks I had to do during the process, which makes it mistake-prone busy work (remembering to log what questions i exported, remembering to clear filters, remembereing to clear previously selected questions, counting from top down to see how far i got into a page, exporting both a key version and a no-headers version,...)

## 🤹 Workflow 🤹 ##
### 1. Automatic Logging + Marking ###
- The extension automatically tracks questions selected by the user
- The user confirms whether they have exported the questions (analogous to having completed the questions)
- Tool saves the exported question IDs, then mark visible questions with IDs matching them (blue highlights)
### 2. Automatic question set creator ###
- Users select what questions section (R&W)
- Categories of questions (Words in Context, Boundaries,...)
- Number of questions
- Difficulty ratio (how many easy, medium, hard)
- Tool filters through all of the filters, selecting the questions for them.
- Users only have to hit the export button twice (for key and no-key versions)

## 😥 Limitations 😥 ##
What the tool isn't guaranteed to do, what the tool does not do, what the tool can still improve on
- The extension popup UI needs heavy improvement
- There is no guarantee the extension would still continue to work if College Board decides to overhaul their web UI design/properties
- Requires user confirmation for most things, like marking questions as exported, or question properties selection
- Due to technical matters, the automation process may only save users from the effort, and the time reduced may not actually be that significant.

## Demo ##
[Watch demo video](docs/assets/videos/autolog_mark_demo.gif)

## 🔮 Future changes improvements 🔮 ##
- [ ] Improve popup UI
- [ ] Add demo video
- [ ] Add a section for users to mark what questions they got wrong, then a dashboard for 	those mistakes so users can plan next actions easier.
- [ ] Reasoning for each mistakes too, self-reflections on why the users got the questions 	wrong/shaky answers, why answers felt tempting
- [ ] AI features could offer suggestions/recommendations regarding how to improve those 	areas.
