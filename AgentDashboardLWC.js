import { LightningElement, track } from 'lwc';
import { subscribe, unsubscribe, onError } from 'lightning/empApi'; // Conexión HTTP reactiva de Salesforce

export default class DashboardAgente extends LightningElement {
    @track transcript = '';
    @track dashboardId = '0FKxx000000000xxxx'; 
    recognition;
    channelName = '/event/Dashboard_Update__e'; 
    subscription = {};

    connectedCallback() {
        // Inicializa el motor de reconocimiento de voz nativo
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.lang = 'es-MX';
        
        this.recognition.onresult = (event) => {
            this.transcript = event.results.transcript;
            this.dispatchEvent(new CustomEvent('voicesearch', { detail: this.transcript }));
        };
        
        this.iniciarSuscripcionEventos();
    }

    startListening() {
        this.recognition.start();
    }

    iniciarSuscripcionEventos() {
        // Conecta al evento de plataforma
        subscribe(this.channelName, -1, (message) => {
            if(message.data.payload.Dashboard_Id__c) {
                this.dashboardId = message.data.payload.Dashboard_Id__c;
            }
        }).then(response => {
            this.subscription = response;
        });
    }
}
