function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function dragStart(e) {
  e.dataTransfer.setData(e.target.id, '');
}

function dragEnter(e) {
  e.preventDefault();
  (e.target.id ? e.target : e.target.parentElement).classList.add('drag-over');
}

function dragOver(e) {
  e.preventDefault();
  (e.target.id ? e.target : e.target.parentElement).classList.add('drag-over');
}

function dragLeave(e) {
  (e.target.id ? e.target : e.target.parentElement).classList.remove('drag-over');
}

function StickyNote(props) {  
  function drop(e) {
    (e.target.id ? e.target : e.target.parentElement).classList.remove('drag-over');
  }

  function sortNotes(e) {
    e.preventDefault();
    (e.target.id ? e.target : e.target.parentElement).classList.add('drag-over');

    const id = e.dataTransfer.types[0];
    const draggableIndex = props.notes.findIndex(note => note.id === id);
    const enteredIndex = props.notes.findIndex(note => note.id === (e.target.id || e.target.parentElement.id));

    if (draggableIndex === enteredIndex) return;

    function sortArrayElements(arr, draggableIndex, enteredIndex) {
      const diff = draggableIndex - enteredIndex;
      const leftSide = arr.slice(0, diff > 0 ? enteredIndex : enteredIndex + 1);
      if (diff < 0) leftSide.splice(draggableIndex, 1);
      const rightSide = arr.slice(diff > 0 ? enteredIndex : enteredIndex + 1);
      if (diff > 0) rightSide.splice(draggableIndex - leftSide.length, 1);
      return [...leftSide, arr[draggableIndex], ...rightSide];
    };

    props.setNotes(sortArrayElements(props.notes, draggableIndex, enteredIndex));
  }

  const note = props.notes.find(x => x.id === props.id);
  const noteIndex = props.notes.findIndex(x => x.id === props.id);

  function onChangeHandler(e) {
    return props.setNotes([...props.notes.slice(0, noteIndex), { ...note, text: e.target.value },
      ...props.notes.slice(noteIndex + 1)]);
  }

  return (
    <div className="stickyNotes_item" id={props.id} draggable="true" onDragStart={dragStart}
      onDragEnter={sortNotes} onDragOver={dragOver} onDragLeave={dragLeave} onDrop={drop}
      style={{backgroundColor: props.backgroundColor}}>
      <textarea className="stickyNotes_itemText" value={note.text} placeholder="Write something"
        onChange={(e) => onChangeHandler(e)} />
    </div>
  );
}

function StickyNotes() {
  const [notes, setNotes] = React.useState(JSON.parse(localStorage.getItem('notes') || null) 
    || [{ id: uuidv4(), text: '', backgroundColor: getRandomColor() }]);

  function getRandomColor() {
    return `hsl(${Math.random() * 360}deg ${Math.random() * 100}% 80%`;
  }

  function removeNote(e) {
    e.target.classList.remove('drag-over');
    const id = e.dataTransfer.types[0];
    const noteIndex = notes.findIndex(note => note.id === id);
    setNotes([...notes.slice(0, noteIndex), ...notes.slice(noteIndex + 1)]);
  }

  React.useEffect(() => {
    if (notes) localStorage.setItem('notes', JSON.stringify(notes));
  });

  return (
    <div>
      <h1>Sticky notes</h1>
      <div className="stickyNotes">
        {notes.map((note, index) => <StickyNote key={note.id} id={note.id} text={note.text}
          backgroundColor={note.backgroundColor} setNotes={setNotes} notes={notes} />)}
      </div>
      <div className="stickyNotes_remove" id="trash" onDragEnter={dragEnter} onDragOver={dragOver}
        onDragLeave={dragLeave} onDrop={removeNote}></div>
      <button className="stickyNotes_create"
        onClick={() => setNotes([...notes, { id: uuidv4(), text: '', backgroundColor: getRandomColor() }])}>
        +
      </button>
    </div>
  );
}

let domContainer = document.querySelector('#root');
ReactDOM.render(<StickyNotes />, domContainer);