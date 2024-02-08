import { useState } from 'react';
import logo from './assets/logo.svg';
import { NewNoteCard } from './components/new-note-card';
import { NoteCard } from './components/note-card';

export interface Note {
	id: string;
	content: string;
	createdAt: Date;
}

export function App() {
	const [search, setSearch] = useState<string>('');
	const [notes, setNotes] = useState<Note[]>(() => {
		const storedNotes = localStorage.getItem('notes');
		return storedNotes ? JSON.parse(storedNotes) : [];
	});

	function onNoteCreated(content: string) {
		const newNote = {
			id: crypto.randomUUID(),
			content,
			createdAt: new Date(),
		};

		setNotes((prevNotes) => {
			localStorage.setItem('notes', JSON.stringify([newNote, ...prevNotes]));

			return [newNote, ...prevNotes];
		});
	}

	function onNoteDeleted(noteId: string) {
		setNotes((prevNotes) => {
			const updatedNotes = prevNotes.filter((note) => note.id !== noteId);
			localStorage.setItem('notes', JSON.stringify(updatedNotes));

			return updatedNotes;
		});
	}

	function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
		setSearch(event.target.value);
	}

	const filteredNotes =
		search !== ''
			? notes.filter(
					(note) => note.content.toLowerCase().includes(search.toLowerCase())
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  )
			: notes;

	return (
		<div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
			<img src={logo} alt="Expert Notes" />

			<form className="w-full">
				<input
					type="text"
					placeholder="Busque em suas notas..."
					className="w-full bg-transparent text-3xl font-semibold tracking-tight placeholder:text-slate-500 outline-none"
					onChange={handleSearch}
				/>
			</form>

			<div className="h-px bg-slate-700" />

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[250px] gap-6">
				<NewNoteCard onNoteCreated={onNoteCreated} />
				{filteredNotes.map((note) => (
					<NoteCard key={note.id} note={note} onNoteDeleted={onNoteDeleted} />
				))}
			</div>
		</div>
	);
}
