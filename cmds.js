
const {log, biglog, errorlog, colorize} = require("./out");

const model = require('./model');

exports.helpCmd = rl => {
	log("Comandos:");
	log("h|help - Muestra esta ayuda.");
	log("list - Lista los quizzes existentes.");
	log("show <id> - Muestra la pregunta y la respuesta de quiz indicado.");
	log("add - Añadir nuevo quiz interactivamente.");	
	log("delete <id> - Borra el quiz indicado.");
	log("edit <id> - Edita el quiz indicado.")
	log("test <id> - Prueba el quiz indicado.");
	log("p|play - Jugar a pretguntar aleatoriamente todos los quizzes.");
	log("credits - Creditos.");
	log("q|quit - Salir del programa.");
	rl.prompt();

};

exports.listCmd = rl => {
	model.getAll().forEach((quiz,id) =>{
		log(`[${colorize(id,'magenta')}]: ${quiz.question}`);
	});

	rl.prompt();
};

exports.addCmd = rl => {
	
	rl.question(colorize('Introduzca una pregunta:','red'), question => {
		rl.question(colorize('Introduzca la respuesta','red'), answer =>{
			model.add(question,answer);
			log(`[${colorize('Se ha añadido','magenta')}]: ${question} ${colorize('=>','magenta')} ${answer}`);
			rl.prompt();
		});
	});

	
};

exports.showCmd = (rl,id) => {
	
	if (typeof id ==="undefined") {
		errorlog(`Falta el parámetro id.`);
	} else {
		try{
			const quiz = model.getByIndex(id);
			log(`[${colorize(id,'magenta')}]: ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
		} catch(error){
			errorlog(error.message);
		}
	}

	rl.prompt();
};

exports.testCmd =(rl,id) => {
	
	if (typeof id ==="undefined") {
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	} else {
		try{
			const quiz = model.getByIndex(id);
			rl.question(colorize(`${quiz.question}? `,'red'), resp =>{

				if (resp.toLowerCase().trim()===quiz.answer.toLowerCase().trim()) {
					log(`Su respuesta es correcta.`);
					biglog('CORRECTO','green');
				}else{
					biglog('INCORRECTO','red');
					log(`Su respuesta es incorrecta.`);
				}
				rl.prompt();
			});
			
		} catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}

};

exports.playCmd = rl => {
	
	let score = 0;
	let toBeResolved = [];
	model.getAll().forEach((quiz,id) =>{
		toBeResolved.push(id);
	});
	

		const playOne= () => {
			if(toBeResolved.length === 0){
				errorlog(`No hay nada mas que preguntar`);
				log(`Fin del juego!: ${colorize(score,'green')} aciertos.`);
				rl.prompt();

			}else{
			var rnd =Math.floor(Math.random()*toBeResolved.length);
			var rndId = toBeResolved[rnd];
			//var rndId = new Random().nextInt(toBeResolved.length);
			let quiz = model.getByIndex(rndId);
				rl.question(colorize(`${quiz.question}? `,'red'), resp =>{

					if (resp.toLowerCase().trim()===quiz.answer.toLowerCase().trim()) {
						biglog('CORRECTO','green');
						score++;
						
						log(`CORRECTO - Lleva  ${colorize(score,'green')} aciertos.`);
						//toBeResolved.splice(rndId,1);
						toBeResolved.splice(rnd,1);
								
						playOne();
					}else{
						biglog('INCORRECTO','red');
						log(`Su respuesta es incorrecta.`);
						log(`Fin del juego. Aciertos; ${colorize(score,'green')} `);
						rl.prompt();
					}

				});

			
			
			}

		}
	playOne();


};

exports.deleteCmd = (rl,id) => {

	if (typeof id ==="undefined") {
		errorlog(`Falta el parámetro id.`);
	} else {
		try{
			model.deleteByIndex(id);
		} catch(error){
			errorlog(error.message);
		}
	}

	rl.prompt();
};

exports.editCmd = (rl,id) => {
	
	if (typeof id ==="undefined") {
		errorlog(`Falta el parámetro id.`);
	} else {
		try{

			const quiz = model.getByIndex(id);
			
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

			rl.question(colorize('Introduzca una pregunta:','red'), question => {
				
				process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
				
				rl.question(colorize('Introduzca la respuesta','red'), answer =>{
					model.update(id,question,answer);
					log(`[${colorize('Se ha cambiado el quiz','magenta')}]: ${question} ${colorize('=>','magenta')} ${answer}`);
					rl.prompt();
				});
			});
		} catch(error){
			errorlog(error.message);
			rl.prompt();
		}
	}
};




exports.creditsCmd = rl => {
	log('Autor de la practica:');
	log('Bruno Gonzalez Lopez','green');
	rl.prompt();
};

exports.quitCmd = rl =>{
	rl.close();
};
