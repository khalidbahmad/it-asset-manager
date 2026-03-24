const INIT = {
    auth: { loggedIn:false, role:'' },
    assets: [
        {id:1,tag:'AST-0042',serial:'SN-HP-2024-001',model:'HP EliteBook 850 G9',category:'Laptop',brand:'HP',location:'Casablanca - Siège',status:'available',assignedTo:null,purchase:'2024-01-15',warranty:'2027-01-15'},
        {id:2,tag:'AST-0043',serial:'SN-DELL-2023-117',model:'Dell OptiPlex 7090',category:'Desktop',brand:'Dell',location:'Rabat - Agence',status:'assigned',assignedTo:'Youssef Alami',purchase:'2023-06-10',warranty:'2026-06-10'},
        {id:3,tag:'AST-0044',serial:'SN-CISCO-2022-088',model:'Cisco IP Phone 8811',category:'Téléphone',brand:'Cisco',location:'Casablanca - Siège',status:'assigned',assignedTo:'Fatima Benali',purchase:'2022-11-03',warranty:'2025-11-03'},
        {id:4,tag:'AST-0045',serial:'SN-SAM-2024-033',model:'Samsung 27" Monitor',category:'Écran',brand:'Samsung',location:'Marrakech - Bureau',status:'available',assignedTo:null,purchase:'2024-02-20',warranty:'2027-02-20'},
        {id:5,tag:'AST-0046',serial:'SN-HP-2021-200',model:'HP LaserJet Pro M404',category:'Imprimante',brand:'HP',location:'Casablanca - Siège',status:'maintenance',assignedTo:null,purchase:'2021-04-12',warranty:'2024-04-12'},
        {id:6,tag:'AST-0047',serial:'SN-LEN-2024-055',model:'Lenovo ThinkPad X1',category:'Laptop',brand:'Lenovo',location:'Fès - Agence',status:'available',assignedTo:null,purchase:'2024-03-05',warranty:'2027-03-05'},
        {id:7,tag:'AST-0048',serial:'SN-APP-2023-009',model:'Apple MacBook Pro 14"',category:'Laptop',brand:'Apple',location:'Casablanca - Siège',status:'assigned',assignedTo:'Karim Idrissi',purchase:'2023-09-18',warranty:'2026-09-18'},
        {id:8,tag:'AST-0049',serial:'SN-DELL-2020-301',model:'Dell PowerEdge T40',category:'Serveur',brand:'Dell',location:'Data Center',status:'retired',assignedTo:null,purchase:'2020-01-08',warranty:'2023-01-08'},
    ],
    users:[
        {id:1,username:'admin',password:'admin123',role:'Admin'},

    ],
    employees: [
        {id:1,name:'Youssef Alami',email:'y.alami@company.ma',dept:'Informatique',initials:'YA'},
        {id:2,name:'Fatima Benali',email:'f.benali@company.ma',dept:'Finance',initials:'FB'},
        {id:3,name:'Karim Idrissi',email:'k.idrissi@company.ma',dept:'Direction',initials:'KI'},
        {id:4,name:'Nadia Cherkaoui',email:'n.cherkaoui@company.ma',dept:'RH',initials:'NC'},
        {id:5,name:'Omar Tazi',email:'o.tazi@company.ma',dept:'Commercial',initials:'OT'},
        {id:6,name:'Soufiane El Fassi',email:'s.elfassi@company.ma',dept:'Technique',initials:'SE'},
    ],
    movements: [
        {id:1,asset:'AST-0044 — Samsung Monitor',from:'Casablanca Siège',to:'Marrakech Bureau',type:'transfer',time:'Hier 16:48',icon:'🔄'},
        {id:2,asset:'AST-0043 — Dell OptiPlex',from:'Stock',to:'Youssef Alami',type:'assign',time:'Aujourd\'hui 14:32',icon:'✅'},
        {id:3,asset:'AST-0048 — Apple MacBook',from:'Karim Idrissi',to:'Stock',type:'return',time:'22/03/2025',icon:'↩️'},
    ],
    assignments: [
        {id:1,assetId:43,employeeId:1,assignedAt:'Aujourd\'hui 14:32',status:'assigned'},
        {id:2,assetId:48,employeeId:3,assignedAt:'22/03/2025',status:'returned'},
    ],

    auditLogs: [
        {id:1,action:'AST-0043 affecté à Youssef Alami',user:'Admin',time:'Aujourd\'hui 14:32',dot:'#4f8ef7'},
        {id:2,action:'Matériel AST-0047 ajouté (Lenovo ThinkPad)',user:'IT Manager',time:'Aujourd\'hui 11:15',dot:'#38d9a9'},
        {id:3,action:'Transfert AST-0044 : Casablanca → Marrakech',user:'Technicien',time:'Hier 16:48',dot:'#f6a623'},
        {id:4,action:'AST-0046 mis en maintenance',user:'Admin',time:'Hier 09:20',dot:'#f6a623'},
        {id:5,action:'Retour AST-0048 — Karim Idrissi',user:'IT Manager',time:'22/03/2025',dot:'#38d9a9'},
    ],
    categories: ['Laptop','Desktop','Écran','Téléphone','Imprimante','Serveur'],
    brands:     ['HP','Dell','Lenovo','Apple','Samsung','Cisco'],
    sites:      ['Casablanca — Siège','Rabat — Agence','Marrakech — Bureau','Fès — Agence','Data Center'],
    roles:      ['Admin','IT Manager','Technicien'],
    statuses:     ['available','assigned','maintenance','retired'],
    departments: ['Informatique','Finance','Direction','RH','Commercial','Technique'],
    toasts:    [],
    locations: ['Casablanca - Siège', 'Rabat - Agence', 'Marrakech - Bureau', 'Fès - Agence', 'Data Center'],
    seats: ['Bureau 1', 'Bureau 2', 'Bureau 3', 'Bureau 4', 'Bureau 5'],
    actionLog: [],
};

export default INIT;