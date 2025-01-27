import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DishService } from '../services/dish.service';

import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { expand, flyInOut, visibility } from '../animations/app.animation';


@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {

  @ViewChild('fform') commentFormDirective;
  commentForm: FormGroup;
  comment: Comment;

  formErrors = {
    'rating': '',
    'comment': '',
    'author': '',
    'date': ''
  };

  validationMessages = {
    'rating': '',
    'comment': {
      'required': 'Comment is required.'
    },
    'author': {
      'required': 'Name is required.',
      'minlength': 'Name must be at least 2 characters long.'
    },
    'date': ''
  };

  dishcopy: Dish;
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  errMess: string;

  visibility = 'shown';

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private c: FormBuilder,
    @Inject('BaseURL') public BaseURL) {
    this.createForm();
  }

  getComment() { return this.commentForm.get('comment').value; }
  getAuthor() { return this.commentForm.get('author').value; }
  getRating() { return this.commentForm.get('rating').value; }

  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds, errmess => this.errMess = <any>errmess);

    this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); }, errmess => this.errMess = <any>errmess);

    this.route.params
      .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); },
        errmess => this.errMess = <any>errmess);

    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.getDish(+params['id']); }))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
        errmess => this.errMess = <any>errmess);
  }

  createForm() {
    this.commentForm = this.c.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      comment: ['', [Validators.required]],
      rating: 0
    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now

  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    var date = new Date();
    this.comment = this.commentForm.value;
    this.comment.date = date.toString();
    console.log(this.comment);
    //this.dish.comments.push(this.comment);
    this.commentForm.reset({
      rating: 0,
      comment: '',
      author: ''
    });
    this.commentFormDirective.resetForm();

    this.dishcopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
        errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }



}
