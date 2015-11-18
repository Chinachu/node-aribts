"use strict";

const TsReader = require("../reader");
const TsDescriptorCompatibility = require("./compatibility");

class TsDescriptorDownloadContent {
    constructor(buffer) {
        this.buffer = buffer;
    }

    decode() {
        var reader = new TsReader(this.buffer);
        var objDescriptor = {};

        objDescriptor._raw = this.buffer;

        objDescriptor.descriptor_tag = reader.uimsbf(8);
        objDescriptor.descriptor_length = reader.uimsbf(8);

        objDescriptor.reboot = reader.bslbf(1);
        objDescriptor.add_on = reader.bslbf(1);
        objDescriptor.compatibility_flag = reader.bslbf(1);
        objDescriptor.module_info_flag = reader.bslbf(1);
        objDescriptor.text_info_flag = reader.bslbf(1);
        reader.next(3);    // reserved
        objDescriptor.component_size = reader.uimsbf(32);
        objDescriptor.download_id = reader.uimsbf(32);
        objDescriptor.time_out_value_DII = reader.uimsbf(32);
        objDescriptor.leak_rate = reader.uimsbf(22);
        reader.next(2);    // reserved
        objDescriptor.component_tag = reader.uimsbf(8);

        if (objDescriptor.compatibility_flag === 1) {
            let descriptor_length = 1 + ((reader.buffer[reader.position >> 3] << 8) | reader.buffer[(reader.position >> 3) + 1]);
            objDescriptor.compatibility_descriptor = new TsDescriptorCompatibility(reader.readBytes(descriptor_length)).decode();
        }

        if (objDescriptor.module_info_flag === 1) {
            objDescriptor.num_of_modules = reader.uimsbf(16);
            objDescriptor.modules = [];

            for (let i = 0; i < objDescriptor.num_of_modules; i++) {
                let _module = {};

                _module.module_id = reader.uimsbf(16);
                _module.module_size = reader.uimsbf(32);
                _module.module_info_length = reader.uimsbf(8);
                _module.module_info_byte = reader.readBytes(_module.module_info_length);

                objDescriptor.modules.push(_module);
            }
        }

        objDescriptor.private_data_length = reader.uimsbf(8);
        objDescriptor.private_data_byte = reader.readBytes(objDescriptor.private_data_length);

        if (objDescriptor.text_info_flag === 1) {
            objDescriptor.ISO_639_language_code = reader.readBytes(3);
            objDescriptor.text_length = reader.uimsbf(8);
            objDescriptor.text_char = reader.readBytes(objDescriptor.text_length);
        }

        return objDescriptor;
    }
}

module.exports = TsDescriptorDownloadContent;