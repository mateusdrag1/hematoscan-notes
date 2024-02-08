import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface NewNoteCardProps {
	onNoteCreated: (content: string) => void;
}

const speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
	const [shouldShowOnboarding, setShouldShowOnboarding] =
		useState<boolean>(true);
	const [isRecording, setIsRecording] = useState<boolean>(false);
	const [content, setContent] = useState<string>('');

	function handleStartEditing() {
		setShouldShowOnboarding(false);
	}

	function handleContentChanged(event: React.ChangeEvent<HTMLTextAreaElement>) {
		setContent(event.target.value);

		if (event.target.value === '') {
			setShouldShowOnboarding(true);
		}
	}

	function handleSaveNote(event: React.FormEvent<HTMLButtonElement>) {
		event.preventDefault();

		if (content === '') {
			toast.error('A nota não pode estar vazia');
			return;
		}

		onNoteCreated(content);

		setContent('');
		setShouldShowOnboarding(true);

		toast.success('Nota salva com sucesso');
	}

	function handleStartRecording() {
		const isSpeechRecognitionAPIAvailable =
			'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

		if (!isSpeechRecognitionAPIAvailable) {
			toast.error('Seu navegador não suporta a gravação de áudio');
			return;
		}

		setIsRecording(true);
		setShouldShowOnboarding(false);

		const SpeechRecognitionAPI =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		const speechRecognition = new SpeechRecognitionAPI();

		speechRecognition.lang = 'pt-BR';
		speechRecognition.continuous = true;
		speechRecognition.maxAlternatives = 1;
		speechRecognition.interimResults = true;

		speechRecognition.onresult = (event) => {
			const transcription = Array.from(event.results).reduce((text, result) => {
				return text.concat(result[0].transcript);
			}, '');

			setContent(transcription);
		};

		speechRecognition.onerror = (event) => {
			console.error(event);
		};

		speechRecognition.start();
	}

	function handleStopRecording() {
		setIsRecording(false);

		speechRecognition?.stop();
	}

	return (
		<Dialog.Root>
			<Dialog.Trigger className=" flex flex-col rounded-md bg-slate-700 p-5 gap-3 outline-none overflow-hidden text-left hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
				<span className="text-sm font-medium text-slate-200">
					Adicionar nota
				</span>
				<p className="text-sm leading-6 text-slate-400">
					Grave uma nota em áudio que será convertida para texto automaticamente
				</p>
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Overlay className="inset-0 fixed bg-black/50" />
				<Dialog.Content className=" fixed inset-0 md:inset-auto overflow-hidden md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col outline-none">
					<Dialog.DialogClose className="absolute top-0 right-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
						<X className="size-5" />
					</Dialog.DialogClose>

					<form className="flex-1 flex flex-col">
						<div className="flex flex-1 flex-col gap-3 p-5">
							<span className="text-sm font-medium text-slate-200">
								Adicionar nota
							</span>
							{shouldShowOnboarding ? (
								<p className="text-sm leading-6 text-slate-300">
									Comece{' '}
									<button
										className="font-medium text-lime-400 hover:underline"
										type="button"
										onClick={handleStartRecording}
									>
										gravando uma nota
									</button>{' '}
									em áudio ou se preferir{' '}
									<button
										className="font-medium text-lime-400 hover:underline"
										type="button"
										onClick={handleStartEditing}
									>
										utilize apenas texto
									</button>
									.
								</p>
							) : (
								<textarea
									autoFocus
									className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
									onChange={handleContentChanged}
									value={content}
									placeholder="Digite sua nota aqui"
								/>
							)}
						</div>

						{isRecording ? (
							<button
								type="button"
								className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 hover:text-slate-100 outline-none font-medium"
								onClick={handleStopRecording}
							>
								<div className="size-3 rounded-full bg-red-500 animate-pulse" />
								Gravando! (clique p/ interromper)
							</button>
						) : (
							<button
								type="button"
								onClick={handleSaveNote}
								className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 hover:bg-lime-500 outline-none font-medium"
							>
								Salvar nota
							</button>
						)}
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
