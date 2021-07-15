import {
  Injectable
} from '@angular/core';
import * as $ from 'jquery/dist/jquery.min';
import Swal from 'sweetalert2';
import * as m from 'moment';

@Injectable()
export class IsRequired {
  checkIfRequired(type) {
    let canProceed = "1";
    let message = [];
    $('.required').each(function (i, obj) {
      $(this).removeClass('requiredClass');
    });
    $('.required').each(function (i, obj) {
      if ($(this).hasClass(type)) {
        if ($(this).val() == "" || $(this).val() == null) {
          canProceed = "0";
          $(this).addClass('requiredClass');
          message.push(obj.name);
        } else {
          if ($(this).hasClass('birthday')) {

            if (m().isBefore($(this).val())) {
              canProceed = "0";
              message.push("Valid " + obj.name);
            }
          }
          if ($(this).hasClass('number')) {
            if (isNaN($(this).val())) {
              canProceed = "0";
              message.push("Valid " + obj.name);
            }
          }
        }
      }
    });


    let finalMessage = "";

    if (message.length == 1) {
      finalMessage = message[0] + " is required field.";
    }

    if (message.length == 2) {
      finalMessage = message[0] + " and " + message[1] + " are required fields.";
    }

    if (message.length > 2) {
      finalMessage += message[0];
      for (var i = 1; i < message.length - 1; i++) {
        finalMessage += ", " + message[i];
      }
      finalMessage += " and " + message[message.length - 1] + " are required fields.";

    }

    if (message.length > 0) {
      Swal.fire({
        type: 'error',
        title: 'Incomplete Information.',
        text: finalMessage
      })
    }

    return canProceed;

  }
}