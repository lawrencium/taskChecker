import React from 'react';
import { ContentState, Editor, EditorState } from 'draft-js';

class TaskTextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskTitleEditorState: EditorState.createWithContent(ContentState.createFromText(this.props.taskTitleText || '')),
      taskNotesEditorState: EditorState.createWithContent(ContentState.createFromText(this.props.taskNotesText || '')),
    };

    this.onTaskTitleChange = (taskTitleEditorState) => {
      this.setState({ taskTitleEditorState });
      this.props.onTaskTitleChange(taskTitleEditorState.getCurrentContent().getPlainText());
    };

    this.onTaskNotesChange = (taskNotesEditorState) => {
      this.setState({ taskNotesEditorState });
      this.props.onTaskNotesChange(taskNotesEditorState.getCurrentContent().getPlainText());
    };
  }

  render() {
    return (
      <div className="task-text-editor-container">
        <div className="task-title-container">
          <Editor
            editorState={this.state.taskTitleEditorState}
            onChange={this.onTaskTitleChange}
            placeholder={this.props.titlePlaceholder}
            onBlur={this.props.onBlur}
          />
        </div>
        <div className="task-notes-container">
          <Editor
            editorState={this.state.taskNotesEditorState}
            onChange={this.onTaskNotesChange}
            placeholder={this.props.notesPlaceholder}
            onBlur={this.props.onBlur}
          />
        </div>
      </div>
    );
  }
}

export default TaskTextEditor;
