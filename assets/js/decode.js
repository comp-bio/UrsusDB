function hexdec(hex_string) {
    hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
    return parseInt(hex_string, 16);
}

function dechex(number) {
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }
    return parseInt(number, 10).toString(16);
}

function ord(string) {
    var str = string + '',
        code = str.charCodeAt(0);
    if (0xD800 <= code && code <= 0xDBFF) {
        var hi = code;
        if (str.length === 1) {
            return code;
        }
        var low = str.charCodeAt(1);
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
    }
    if (0xDC00 <= code && code <= 0xDFFF) {
        return code;
    }
    return code;
}

function strtoupper(str) {
    return str.toUpperCase();
}

function genCode(code) {
    var var0 = hexdec(dechex(ord(strtoupper(code[0]))));
    var var1 = hexdec(dechex(ord(code[1])));
    var var2 = hexdec(dechex(ord(code[2])));
    var var3 = hexdec(dechex(ord(code[3])));
    var0 = var0 * 4 + var0;
    var1 = var0 * 2 + var1 - 698;
    var2 = (var2 * 4 + var2) * 2 + var1;
    var3 = var3 + var2 - 528;
    var sum = ((var3 << 3) - var3) % 100;
    var call = Math.floor(sum / 10);
    remainder = sum % 10;
    remainder = remainder * 4 + remainder;
    var varf = remainder * 2 + call;
    eax = 259 % var1 % 100;
    eax = eax * 4 + eax;
    edx = eax * 4 + eax;
    eax = edx * 4 + varf;
    document.getElementById('resval').value = eax;
}