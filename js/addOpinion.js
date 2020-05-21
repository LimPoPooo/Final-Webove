

let nazory=[];

if(localStorage.futbaloveKomenty){
    nazory=JSON.parse(localStorage.futbaloveKomenty);
}

console.log(nazory);
//-----------------------------------------------------------------

function potvrdenieFormular(event){
    let mojFormular=document.getElementById("formular");
    event.preventDefault();

    const meno=mojFormular.elements[0].value;
    const email=mojFormular.elements[1].value;
    var hodnotenie;
    for (var i = 2; i < 4; i++) {
        if (mojFormular.elements[i].checked) {
            hodnotenie = mojFormular.elements[i].value;
            break;
        }
    }
    var odporucanie = 0;
    if (mojFormular.elements[5].checked) {
        odporucanie = 1;
    }
    const komentar=mojFormular.elements[6].value;
    const klucoveSlovo=mojFormular.elements[7].value;

    if(meno=="" || email=="" || komentar=="")
    {
        window.alert("Meno,Email a komentár nesmú byť prázdne ");
        return;
    }


    Parse.serverURL = 'https://parseapi.back4app.com';
    Parse.initialize('GEQs6n5MwHeuCexFXwprvFpFjdMjesCg9pLMH2Iu', '3qUHuCCRXI8T6pGnZAMWXk7uk9d9bURNYqAZBVZy', 'VTtgNLP9hqcucGWovJ1XV6DOAdIsW2YSA7UnBpWt');

    const nazory = Parse.Object.extend('nazory');
    const myNewObject = new nazory();

    myNewObject.set('name', meno);
    myNewObject.set('mail', email);
    myNewObject.set('rating', hodnotenie);
    myNewObject.set('comment', komentar);
    myNewObject.set('keyWord', klucoveSlovo);
    myNewObject.set('created', new Date());
    myNewObject.set('recommendation', odporucanie);

    myNewObject.save().then(
        (result) => {
            if (typeof document !== 'undefined')  console.log('nazory created', result);
            window.location.hash=`#opinions`;
        },
        (error) => {
            if (typeof document !== 'undefined') console.error('Error while creating nazory: ', error);
            window.location.hash=`#opinions`;
        }
    );

}










