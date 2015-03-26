/*
 * Copyright (c) 2010, 2013, Oracle and/or its affiliates. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 *   - Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *
 *   - Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 *
 *   - Neither the name of Oracle nor the names of its
 *     contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var Nashorn     = Packages.jdk.nashorn.internal;
var TokenStream = Nashorn.parser.TokenStream;
var Token       = Nashorn.parser.Token;
var TokenKind   = Nashorn.parser.TokenKind;
var TokenType   = Nashorn.parser.TokenType;
var Lexer       = Nashorn.parser.Lexer;
var Source      = Nashorn.runtime.Source;

var COMMENT     = TokenType.COMMENT;
var DECIMAL     = TokenType.DECIMAL;
var EOF         = TokenType.EOF;
var EOL         = TokenType.EOL;
var ESCSTRING   = TokenType.ESCSTRING;
var EXECSTRING  = TokenType.EXECSTRING;
var FLOATING    = TokenType.FLOATING;
var HEXADECIMAL = TokenType.HEXADECIMAL;
var IDENT       = TokenType.IDENT;
var OCTAL       = TokenType.OCTAL;
var STRING      = TokenType.STRING;

var KEYWORD     = TokenKind.KEYWORD;
var LITERAL     = TokenKind.LITERAL;
var SPECIAL     = TokenKind.SPECIAL;

function AskariLayout(name, chars) {
    function getTokens(source) {
        var stream = new TokenStream();
        var lexer  = new Lexer(source, stream, true);
        var tokens = [];

        var i  = 0;
        do {
            while (i > stream.last()) {
                if (stream.isFull()) stream.grow();
                lexer.lexify();
            }

            var token         = stream.get(i++);
            var tokenType     = Token.descType(token);
            var tokenKind     = tokenType.kind;
            var tokenPosition = Token.descPosition(token);
            var tokenLength   = Token.descLength(token);

            tokens.push({tokenType: tokenType, tokenKind: tokenKind, tokenPosition: tokenPosition, tokenLength: tokenLength});
        } while (tokenType != EOF);

        return tokens;
    }

    var textFlow = new TextFlow();

    function addText(string, font, color) {
        var text = new Text(string);
        text.font = font;
        if (color) text.fill = color;
        textFlow.children.add(text);
    }

    function flowLine(run) {
        var source = Source.sourceFor(name, run);
        var tokens = getTokens(source);
        var position = 0;

        for each (var token in tokens) {
            function addRun(finish, font, color) {
                var length = finish - position;

                if (length != 0) {
                    var string = run.substring(position, finish);

                    // Hack to get around TextFlow bug.
                    if (string == "\n") {
                        string = " \n";
                    }

                    addText(string, font, color);
                    position = finish;
                }
            }

            function addPriorRun(tokenPosition) {
                addRun(tokenPosition, FONT_NORMAL);
            }

            var tokenType = token.tokenType;
            var tokenKind = token.tokenKind;
            var tokenFinish = token.tokenPosition + token.tokenLength;

            if (tokenKind == KEYWORD) {
                addPriorRun(token.tokenPosition);
                var keyword = run.substr(token.tokenPosition, token.tokenLength);

                if (keyword == "this") {
                    addRun(tokenFinish, FONT_NORMAL, Color.GREEN);
                } else {
                    addRun(tokenFinish, FONT_NORMAL, Color.BLUE);
                }
            } else if (tokenType == IDENT) {
                var ident = run.substr(token.tokenPosition, token.tokenLength);
                if (ident.toUpperCase() == ident) {
                    addPriorRun(token.tokenPosition);
                    addRun(tokenFinish, FONT_NORMAL, Color.PURPLE);
                }
            } else if (tokenKind == LITERAL) {
                addPriorRun(token.tokenPosition);
                addRun(tokenFinish, FONT_NORMAL, Color.RED);
            } else if (tokenType == COMMENT) {
                addPriorRun(token.tokenPosition);
                addRun(tokenFinish, FONT_ITALIC, Color.GRAY);
            } else if (tokenType == EOF) {
                addPriorRun(token.tokenPosition);
            }
        }
    }

    var stopImage = new Image(fileToURL("images/linestop.png").toString());
    var arrowImage = new Image(fileToURL("images/linearrow.png").toString());

    var lines = chars.trimRight().split(/\n/);
    lines.push("");
    var length = lines.length;
    var stops = new Array(length + 1);
    var arrows = new Array(length + 1);
    var width = String(length).length + 1;

    function lineStart(i) {
        addText(" ", FONT_NORMAL);
        textFlow.children.add(stops[i]);
        var lineNumber = "          " + (i + 1);
        lineNumber = lineNumber.substring(lineNumber.length - width);
        addText(lineNumber, FONT_NORMAL, Color.GRAY);
        textFlow.children.add(arrows[i]);
    }

    for (var i = 0; i <= length; i++) {
        var image = new ImageView(stopImage);
        image.opacity = 0.05;
        image.translateY = 2;
        stops[i] = image;

        image = new ImageView(arrowImage);
        image.opacity = 0.0;
        image.translateY = 2;
        arrows[i] = image;
    }

    for (var i = 0; i < length;) {
        lineStart(i);
        var line = lines[i++] + "\n";

        var index;
        while ((index = line.indexOf("/*")) != -1) {
            flowLine(line.substring(0, index));
            line = line.substring(index);

            while ((index = line.indexOf("*/")) == -1 && i < length) {
                addText(line, FONT_ITALIC, Color.GRAY);
                lineStart(i);
                line = lines[i++] + "\n";
            }

            if (index != -1) {
                addText(line.substring(0, index + 2), FONT_ITALIC, Color.GRAY);
                line = line.substring(index + 2);
            }
        }

        // Hack to work around text flow bug.
        if (line == "\n") {
            line = " \n";
        }

        flowLine(line);
     }

    // To to get the last break point to react (height of text based on "\n")
    addText(" \n", FONT_NORMAL);

    this.lines    = line;
    this.textFlow = textFlow;
    this.stops    = stops;
    this.arrows   = arrows;
}
