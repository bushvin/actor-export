#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Copyright: (c) 2024, William Leemans

import os
import re
import sys

def main():
    if len(sys.argv) < 2:
        sys.exit('Error: You need to specify a valid path to a mapping file.')

    mapper_file = sys.argv[1];
    if not os.path.isfile(mapper_file):
        sys.exit('Error: The file you have specified could not be found')

    with open(mapper_file, 'r') as s:
        raw_mapping = s.read()

    raw_mapping = re.sub(r'/\*[^\*]+\*/', '', raw_mapping)
    raw_mapping = re.sub(r'\n', ' ', raw_mapping)
    raw_mapping = re.sub(r'}\s*,', '},', raw_mapping)
    raw_mapping = re.sub('@', 'actor.', raw_mapping)
    raw_results = re.findall(r'{[^}]+}[^,]*,', raw_mapping)

    head = """import { pdfProvider } from 'https://<ENTER FOUNDRY VTT HOSTNAME>/modules/actor-export/scripts/lib/providers/PDFProvider.js';
const mapper = new pdfProvider(actor);
/* This is a very basic mapper for PDF exports */
    """
    tail = "export { mapper };"
    print(head)
    for el in raw_results:
        el = el.strip()
        el = el.rstrip('},')
        el = el.lstrip('{')
        el = el.strip()
        el = re.sub(r'\s+', ' ', el)

        parts = el.partition(",")
        value = parts[2].partition(":")[2]
        form_field = parts[0].split(":")[1].strip().strip("[\"']").strip()

        print("mapper.field('all','%s',%s);" % (form_field, value) )
    print(tail)

if __name__ == "__main__":
    main()
