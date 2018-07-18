function shuffle(o){
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

module.exports = function(characterList) {
    const characters = characterList.slice();

    shuffle(characters);

    const rightValue = Math.floor(Math.random() * 10);
    const variants = [rightValue];

    while (variants.length <= characters.length - 1) {
        const rand = Math.floor(Math.random() * 10);

        if (!variants.includes(rand)) {
            variants.push(rand);
        }
    }

    shuffle(variants);

    return {
        type: 'call-character',
        variants: characters.map((char, index) => ({character: char, value: variants[index]})),
        right: {
            character: characters[variants.indexOf(rightValue)],
            value: rightValue
        }
    }
};