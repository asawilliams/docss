'use strict';

describe('parse.js', function () {

    it('Validate ability to parse CSS example blocks from a CSS file', function () {
        var done = false;
        
        runs(function () {

            var EXAMPLE_VALUE_FORMAT = '{{NAME}} {{INDEX}}\n Line 2\n    Line 3';
            var completed = false;

            function format(name, index) {
                return EXAMPLE_VALUE_FORMAT.replace('{{NAME}}', name).replace('{{INDEX}}', index + 1);
            }

            docss.run(/**docss.IOptions*/{
                files: [
                    'parse.css'
                ],

                baseURL: './data/',

                /**
                 * @param {docss.IParserData} data
                 */
                render: function (/**docss.IParserData*/ data) {

                    //prevent re-runing this in future test
                    if (completed) {
                        return;
                    }
                    else {
                        completed = true;
                    }

                    expect(typeof(data)).toBe('object');
                    expect(data.sections.length).toBe(2);
                    expect(data.examples.length).toBe(2);

                    var i, j, section, example;

                    expect(data.sections.length).toBe(2);

                    for (i = 0; i < data.sections.length; i++) {
                        section = data.sections[i];
                        expect(section.title).toBe(format('Section', i));
                        expect(section.examples.length).toBe(1);
                    }

                    for (i = 0; i < data.examples.length; i++) {
                        example = data.examples[i];
                        expect(example.section).toBe(format('Section', i));
                        expect(example.title).toBe(format('Title', i));
                        expect(example.example.value).toBe(format('Example', i));
                        expect(example.javascript.value).toBe(format('JavaScript', i));

                        expect(example.warnings.length).toBe(2);
                        for (j = 0; j < example.warnings.length; j++) {
                            expect(example.warnings[j]).toBe(format('Warning', j));
                        }

                        expect(example.notes.length).toBe(2);
                        for (j = 0; j < example.notes.length; j++) {
                            expect(example.notes[j]).toBe(format('Note', j));
                        }

                        expect(example.todos.length).toBe(2);
                        for (j = 0; j < example.todos.length; j++) {
                            expect(example.todos[j]).toBe(format('TODO', j));
                        }

                        expect(example.tags.length).toBe(2);
                        for (j = 0; j < example.tags.length; j++) {
                            expect(example.tags[j]).toBe(format('Tag', j));
                        }
                    }

                    done = true;
                }
            });
            
        });

        waitsFor(function () {
            return done;
        }, 'Render should have completed', 2000);
    });

});